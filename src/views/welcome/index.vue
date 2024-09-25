<script setup lang="ts">
import { initServer } from "@/ipc/sftp-server";
import { connectServer, uploadFile } from "@/ipc/sftp-client";

defineOptions({
  name: "Welcome"
});

const handleInitServer = () => {
  initServer().then(res => {
    console.log(res);
  });
};
const handleConnectServer = () => {
  connectServer({ ip: "192.168.50.144", port: 50021 });
};
const handleUploadFileToServer = () => {
  uploadFile("database.db", "database.template.db");
};
</script>

<template>
  <h1>Pure-Admin-Thin（非国际化版本）</h1>
  <button @click="handleInitServer">创建服务器</button>
  <button @click="handleConnectServer">| 加入服务器</button>
  <button @click="handleUploadFileToServer">同步数据库文件</button>
</template>
