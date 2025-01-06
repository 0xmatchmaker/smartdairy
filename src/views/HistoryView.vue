<template>
  <div class="history-view">
    <van-nav-bar
      title="历史记录"
      left-arrow
      @click-left="$router.back()"
    />
    
    <div class="entries">
      <van-cell
        v-for="entry in historyEntries"
        :key="entry.id"
        :title="entry.timestamp"
        :label="entry.content"
      />
    </div>
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

const historyEntries = computed(() => {
  return store.getDiaryEntries.map(entry => ({
    ...entry,
    content: decryptContent(entry)
  }))
})
</script> 