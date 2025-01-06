<template>
  <div class="timeline">
    <van-timeline>
      <van-timeline-item
        v-for="item in timelineItems"
        :key="item.id"
        :timestamp="item.timestamp"
      >
        {{ item.content }}
      </van-timeline-item>
    </van-timeline>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { keyManager } from '@/services/key-manager'
import { encryption } from '@/services/encryption'

const store = useDiaryStore()

const decryptContent = (entry: DiaryEntry) => {
  if (entry.encrypted) {
    const password = keyManager.getPassword()
    if (password) {
      return encryption.decrypt(entry.content, password)
    }
    return '[加密内容]'
  }
  return entry.content
}

const timelineItems = computed(() => {
  return store.getDiaryEntries.map(entry => ({
    ...entry,
    content: decryptContent(entry)
  }))
})
</script> 