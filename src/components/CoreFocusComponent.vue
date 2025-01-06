<template>
  <div class="core-focus">
    <van-field
      v-model="focusContent"
      type="textarea"
      placeholder="今天最重要的事情是..."
      rows="3"
      autosize
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const focusContent = ref('')
</script>

<style scoped lang="scss">
.core-focus {
  // 样式
}
</style> 