<template>
  <div class="diary-view">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="日记"
      right-text="历史"
      @click-right="goToHistory"
    />

    <!-- 标签页组件 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="时间轴">
        <div class="content-area">
          <TimelineComponent />
        </div>
      </van-tab>
      <van-tab title="今日核心">
        <div class="content-area">
          <div class="core-section">
            <div class="health-basics">
              <h3>基础健康</h3>
              <CoreFocusComponent />
            </div>
            <div class="dreams-tracking">
              <h3>梦想追踪</h3>
              <DreamsComponent />
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 快速记录面板 -->
    <QuickNotePanel />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TimelineComponent from '@/components/TimelineComponent.vue'
import CoreFocusComponent from '@/components/CoreFocusComponent.vue'
import DreamsComponent from '@/components/DreamsComponent.vue'
import QuickNotePanel from '@/components/QuickNotePanel.vue'

const router = useRouter()
const activeTab = ref(0)

const goToHistory = () => {
  router.push('/history')
}
</script>

<style scoped lang="scss">
.diary-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  padding-bottom: 60px; // 为底部面板留出空间
  overflow-y: auto;
}

.core-section {
  padding: 16px;
  
  h3 {
    margin: 16px 0 12px;
    color: #323233;
  }
}
</style> 