<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDiaryStore } from './stores/diary'
import { keyManager } from '@/services/key-manager'

const store = useDiaryStore()

// 定期同步
const setupAutoSync = () => {
  // 首次加载时同步
  store.syncData()
  
  // 每5分钟同步一次
  setInterval(() => {
    store.syncData()
  }, 5 * 60 * 1000)
  
  // 网络恢复时同步
  window.addEventListener('online', () => {
    store.syncData()
  })
}

onMounted(() => {
  setupAutoSync()
  // 尝试从 localStorage 加载密码
  keyManager.getPassword()
})
</script>

<style>
.app {
  height: 100vh;
  width: 100vw;
}
</style> 