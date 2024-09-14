<script setup lang="ts">
import { ipcRenderer } from "electron";

defineOptions({
  name: "Welcome"
});

const handleClick = () => {
  console.log("aaaa");
  ipcRenderer.send("connect-client");
};
</script>

<template>
  <h1>Pure-Admin-Thin（非国际化版本）</h1>
  <button @click="handleClick">Open Dialog</button>
</template>
