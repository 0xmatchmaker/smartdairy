<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'

const store = useDiaryStore()

onMounted(async () => {
  console.log('App mounted, initializing store...')
  await store.init()
  console.log('Store initialized')
})
</script>

<style>
.app {
  height: 100vh;
  width: 100vw;
}
</style> 