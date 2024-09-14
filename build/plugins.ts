import path from "node:path";
import fs from "node:fs";
import { cdn } from "./cdn";
import vue from "@vitejs/plugin-vue";
import { pathResolve } from "./utils";
import { viteBuildInfo } from "./info";
import svgLoader from "vite-svg-loader";
import type { PluginOption } from "vite";
import checker from "vite-plugin-checker";
import vueJsx from "@vitejs/plugin-vue-jsx";
import electron from "vite-plugin-electron";
import Inspector from "vite-plugin-vue-inspector";
import { configCompressPlugin } from "./compress";
import removeNoMatch from "vite-plugin-router-warn";
import renderer from "vite-plugin-electron-renderer";
import { visualizer } from "rollup-plugin-visualizer";
import removeConsole from "vite-plugin-remove-console";
import { themePreprocessorPlugin } from "@pureadmin/theme";
import { genScssMultipleScopeVars } from "../src/layout/theme";
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import pkg from "../package.json";
import type { Plugin } from "vite";
import virtual from "vite-plugin-virtual";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export function getPluginsList(
  command: string,
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression
): PluginOption[] {
  const prodMock = true;
  const isServe = command === "serve";
  const isBuild = command === "build";
  const lifecycle = process.env.npm_lifecycle_event;
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
  return [
    vue(),
    // jsx、tsx语法支持
    vueJsx(),
    checker({
      typescript: true,
      vueTsc: true,
      eslint: {
        lintCommand: `eslint ${pathResolve("../{src,mock,build}/**/*.{vue,js,ts,tsx}")}`,
        useFlatConfig: true
      },
      terminal: false,
      enableBuild: false
    }),
    // 按下Command(⌘)+Shift(⇧)，然后点击页面元素会自动打开本地IDE并跳转到对应的代码位置
    Inspector(),
    viteBuildInfo(),
    /**
     * 开发环境下移除非必要的vue-router动态路由警告No match found for location with path
     * 非必要具体看 https://github.com/vuejs/router/issues/521 和 https://github.com/vuejs/router/issues/359
     * vite-plugin-router-warn只在开发环境下启用，只处理vue-router文件并且只在服务启动或重启时运行一次，性能消耗可忽略不计
     */
    removeNoMatch(),
    // mock支持
    vitePluginFakeServer({
      logger: false,
      include: "mock",
      infixName: false,
      enableProd: command !== "serve" && prodMock
    }),
    // 自定义主题
    themePreprocessorPlugin({
      scss: {
        multipleScopeVars: genScssMultipleScopeVars(),
        extract: true
      }
    }),
    // svg组件化支持
    svgLoader(),
    VITE_CDN ? cdn : null,
    configCompressPlugin(VITE_COMPRESSION),
    bindingSqlite3({ command }),
    // 线上环境删除console
    removeConsole({ external: ["src/assets/iconfont/iconfont.js"] }),
    // 打包分析
    lifecycle === "report"
      ? visualizer({ open: true, brotliSize: true, filename: "report.html" })
      : (null as any),
    !lifecycle.includes("browser")
      ? [
          // 支持electron
          electron([
            {
              // Main-Process entry file of the Electron App.
              entry: "electron/main/index.ts",
              onstart(options) {
                if (process.env.VSCODE_DEBUG) {
                  console.log(
                    /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
                  );
                } else {
                  options.startup();
                }
              },
              vite: {
                build: {
                  sourcemap,
                  minify: isBuild,
                  outDir: "dist-electron/main",
                  rollupOptions: {
                    external: [
                      ...Object.keys(
                        "dependencies" in pkg ? pkg.dependencies : {}
                      ),
                      "typeorm",
                      "better-sqlite3"
                    ]
                  }
                },
                plugins: [
                  virtual({
                    "virtual:empty-module": "export default {};"
                  })
                ],
                resolve: {
                  alias: {
                    mongodb: "virtual:empty-module",
                    "hdb-pool": "virtual:empty-module",
                    mssql: "virtual:empty-module",
                    mysql: "virtual:empty-module",
                    mysql2: "virtual:empty-module",
                    oracledb: "virtual:empty-module",
                    pg: "virtual:empty-module",
                    "pg-native": "virtual:empty-module",
                    "pg-query-stream": "virtual:empty-module",
                    "typeorm-aurora-data-api-driver": "virtual:empty-module",
                    redis: "virtual:empty-module",
                    ioredis: "virtual:empty-module",
                    "sql.js": "virtual:empty-module"
                  }
                },
                optimizeDeps: {
                  exclude: ["typeorm", "better-sqlite3"]
                }
              }
            },
            {
              entry: "electron/preload/index.ts",
              onstart(options) {
                // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
                // instead of restarting the entire Electron App.
                options.reload();
              },
              vite: {
                build: {
                  sourcemap: sourcemap ? "inline" : undefined, // #332
                  minify: isBuild,
                  outDir: "dist-electron/preload",
                  rollupOptions: {
                    external: Object.keys(
                      "dependencies" in pkg ? pkg.dependencies : {}
                    )
                  }
                }
              }
            }
          ]),
          // Use Node.js API in the Renderer-process
          renderer()
        ]
      : null
  ];
}

function bindingSqlite3(
  options: {
    output?: string;
    better_sqlite3_node?: string;
    command?: string;
  } = {}
): Plugin {
  const TAG = "[vite-plugin-binding-sqlite3]";
  options.output ??= "dist-native";
  options.better_sqlite3_node ??= "better_sqlite3.node";
  options.command ??= "build";

  return {
    name: "vite-plugin-binding-sqlite3",
    config(config) {
      const path$1 = process.platform === "win32" ? path.win32 : path.posix;
      const resolvedRoot = config.root
        ? path$1.resolve(config.root)
        : process.cwd();
      const output = path$1.resolve(resolvedRoot, options.output);
      const better_sqlite3 = require.resolve("better-sqlite3");
      const better_sqlite3_root = path$1.join(
        better_sqlite3.slice(0, better_sqlite3.lastIndexOf("node_modules")),
        "node_modules/better-sqlite3"
      );
      const better_sqlite3_node = path$1.join(
        better_sqlite3_root,
        "build/Release",
        options.better_sqlite3_node
      );
      const better_sqlite3_copy = path$1.join(
        output,
        options.better_sqlite3_node
      );
      if (!fs.existsSync(better_sqlite3_node)) {
        throw new Error(`${TAG} Can not found "${better_sqlite3_node}".`);
      }
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true });
      }
      fs.copyFileSync(better_sqlite3_node, better_sqlite3_copy);
      /** `dist-native/better_sqlite3.node` */
      const BETTER_SQLITE3_BINDING = better_sqlite3_copy.replace(
        resolvedRoot + path.sep,
        ""
      );
      fs.writeFileSync(
        path.join(resolvedRoot, ".env"),
        `VITE_BETTER_SQLITE3_BINDING=${BETTER_SQLITE3_BINDING}`
      );
    }
  };
}
