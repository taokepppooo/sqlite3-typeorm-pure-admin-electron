import FtpSrv from "ftp-srv";

const port = 50021;

export async function createServer(): Promise<void> {
  const server = new FtpSrv({
    url: `ftp://192.168.50.227:${port}`,
    anonymous: true
  });

  server.on("login", ({ username, password }, resolve, reject) => {
    if (username === "admin" && password === "123456") {
      resolve({ root: "./" });
    } else {
      reject(new Error("Unauthorized"));
    }
  });

  server
    .listen()
    .then(() => {})
    .catch(err => {
      console.log(err);
    });
}
