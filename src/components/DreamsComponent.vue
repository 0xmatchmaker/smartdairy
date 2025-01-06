<template>
  <div class="dreams">
    <van-field
      v-model="dreamContent"
      type="textarea"
      placeholder="记录你的梦想..."
      rows="3"
      autosize
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dreamContent = ref('')
</script>

<style scoped lang="scss">
.dreams {
  // 样式
}
</style> 