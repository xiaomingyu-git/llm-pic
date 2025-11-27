<template>
  <div class="test-hook-component">
    <h2>测试Hook触发</h2>
    <p>这个组件用于测试Edit工具是否能被正确识别</p>
    <button @click="updateMessage">更新消息</button>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hook测试 - Vue文件被修改了')

const updateMessage = () => {
  message.value = '消息已更新 - Hook应该被触发'
}
</script>

<style scoped>
.test-hook-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 10px 0;
}
</style>