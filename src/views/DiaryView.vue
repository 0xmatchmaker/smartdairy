<template>
  <div class="diary-container">
    <!-- 显示加载状态 -->
    <van-loading v-if="isLoading" />
    
    <!-- 显示错误信息 -->
    <van-empty v-if="error" :description="error" />
    
    <!-- 主要内容 -->
    <template v-if="!isLoading && !error">
      <van-nav-bar
        title="我的日记"
        :right-text="currentDate"
        fixed
      />
      
      <div class="content">
        <section class="timeline-section">
          <h2>时间轴</h2>
          <timeline-component />
        </section>

        <section class="core-focus-section">
          <h2>今日核心</h2>
          <core-focus-component />
        </section>

        <section class="dreams-section">
          <h2>梦想追踪</h2>
          <dreams-component />
        </section>

        <van-button
          class="quick-note-btn"
          type="primary"
          icon="plus"
          round
          @click="showQuickNotePanel"
        >
          快速记录
        </van-button>
      </div>

      <quick-note-panel v-model="quickNotePanelVisible" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import TimelineComponent from '@/components/TimelineComponent.vue'
import CoreFocusComponent from '@/components/CoreFocusComponent.vue'
import DreamsComponent from '@/components/DreamsComponent.vue'
import QuickNotePanel from '@/components/QuickNotePanel.vue'
import type { DiaryEntry } from '@/types'

const store = useDiaryStore()
const quickNotePanelVisible = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN')
})

const showQuickNotePanel = () => {
  quickNotePanelVisible.value = true
}

onMounted(async () => {
  try {
    isLoading.value = true
    // 加载数据逻辑
  } catch (e) {
    error.value = '加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.diary-container {
  padding-top: 46px;
  min-height: 100vh;
  background: #f7f8fa;

  .content {
    padding: 16px;

    section {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      h2 {
        font-size: 18px;
        margin-bottom: 12px;
        color: #323233;
      }
    }
  }

  .quick-note-btn {
    position: fixed;
    right: 16px;
    bottom: 24px;
  }
}
</style> 