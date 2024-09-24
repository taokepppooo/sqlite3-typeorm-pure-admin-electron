<script setup lang="ts">
import { initServer } from "@/ipc/sftp-server";

defineOptions({
  name: "Welcome"
});

const handleInitServer = () => {
  initServer();
};
</script>

<template>
  <h1>Pure-Admin-Thin（非国际化版本）</h1>
  <button @click="handleInitServer">创建服务器</button>
</template>
