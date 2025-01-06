<template>
  <div class="quick-note">
    <van-field
      v-model="content"
      type="textarea"
      placeholder="记录此刻的想法..."
      rows="1"
      autosize
    >
      <template #button>
        <van-button 
          size="small" 
          type="primary" 
          :disabled="!content.trim()"
          @click="saveNote"
        >
          记录
        </van-button>
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { showToast } from 'vant'

const store = useDiaryStore()
const content = ref('')

async function saveNote() {
  if (!content.value.trim()) return

  const entry = {
    id: Date.now().toString(),
    type: 'quick_note',
    content: content.value,
    timestamp: new Date().toISOString()
  }

  await store.addDiaryEntry(entry)
  content.value = ''
  showToast('记录已保存')
}
</script>

<style scoped lang="scss">
.quick-note {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}
</style> 