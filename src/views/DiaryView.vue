<template>
  <div class="diary-view">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="日记"
      right-text="历史"
      @click-right="goToHistory"
    />

    <!-- 梦想总览面板 -->
    <div class="dreams-overview" v-if="hasActiveDreams">
      <h3>今日目标追踪</h3>
      <div class="dreams-grid">
        <div 
          v-for="dream in dreams" 
          :key="dream.id"
          class="dream-card"
          :class="{ completed: isDreamCompleted(dream) }"
        >
          <div class="dream-header">
            <span class="dream-title">{{ dream.title }}</span>
            <van-tag 
              :type="isDreamCompleted(dream) ? 'success' : 'primary'"
              size="small"
            >
              {{ formatProgress(dream) }}
            </van-tag>
          </div>
          <div class="dream-stats">
            <div class="stat-item">
              <span class="label">已投入</span>
              <span class="value">{{ formatTime(dream.accumulatedSeconds) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">目标</span>
              <span class="value">{{ dream.dailyGoalMinutes }}分钟</span>
            </div>
          </div>
          <van-progress
            :percentage="calculateProgress(dream)"
            :color="getProgressColor(dream)"
          />
        </div>
      </div>
    </div>

    <!-- 标签页组件 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="时间轴">
        <TimelineComponent />
      </van-tab>
      <van-tab title="今日核心">
        <div class="core-section">
          <!-- 基础健康模块 -->
          <div class="health-basics">
            <h3>基础健康</h3>
            <CoreFocusComponent />
          </div>
          
          <!-- 梦想追踪模块 -->
          <div class="dreams-tracking">
            <h3>梦想追踪</h3>
            <DreamsComponent />
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 快速记录面板 -->
    <QuickNotePanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diary'
import TimelineComponent from '@/components/TimelineComponent.vue'
import CoreFocusComponent from '@/components/CoreFocusComponent.vue'
import DreamsComponent from '@/components/DreamsComponent.vue'
import QuickNotePanel from '@/components/QuickNotePanel.vue'
import { keyManager } from '@/services/key-manager'
import { encryption } from '@/services/encryption'

const router = useRouter()
const store = useDiaryStore()
const activeTab = ref(0)

// 获取梦想数据
const dreams = computed(() => store.getActiveDreams)
const hasActiveDreams = computed(() => dreams.value.length > 0)

// 格式化时间显示
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

// 计算进度
const calculateProgress = (dream: any) => {
  const goalSeconds = dream.dailyGoalMinutes * 60
  const progress = Math.min((dream.accumulatedSeconds / goalSeconds) * 100, 100)
  return Math.round(progress)
}

// 格式化进度显示
const formatProgress = (dream: any) => {
  const progress = calculateProgress(dream)
  return `${progress}%`
}

// 判断是否完成
const isDreamCompleted = (dream: any) => {
  return calculateProgress(dream) >= 100
}

// 获取进度条颜色
const getProgressColor = (dream: any) => {
  const progress = calculateProgress(dream)
  if (progress >= 100) return '#07c160'
  if (progress >= 50) return '#1989fa'
  return '#f2f3f5'
}

const goToHistory = () => {
  router.push('/history')
}

function decryptContent(entry: DiaryEntry): DiaryEntry {
  const password = keyManager.getPassword()
  if (entry.encrypted && password) {
    return {
      ...entry,
      content: encryption.decrypt(entry.content, password)
    }
  }
  return entry
}

const entries = computed(() => {
  return diaryEntries.value.map(decryptContent)
})
</script>

<style scoped lang="scss">
.diary-view {
  .dreams-overview {
    padding: 16px;
    background: white;
    margin-bottom: 8px;

    h3 {
      font-size: 15px;
      color: #323233;
      margin-bottom: 12px;
    }

    .dreams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;

      .dream-card {
        background: #f7f8fa;
        border-radius: 8px;
        padding: 12px;
        transition: all 0.3s ease;

        &.completed {
          background: #e8f8f2;
        }

        .dream-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .dream-title {
            font-size: 14px;
            font-weight: 500;
          }
        }

        .dream-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .stat-item {
            display: flex;
            flex-direction: column;
            
            .label {
              font-size: 12px;
              color: #969799;
              margin-bottom: 2px;
            }

            .value {
              font-size: 13px;
              color: #323233;
              font-weight: 500;
            }
          }
        }

        .van-progress {
          height: 3px;
        }
      }
    }
  }

  .core-section {
    padding: 16px;

    .health-basics,
    .dreams-tracking {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      h3 {
        font-size: 15px;
        color: #323233;
        margin-bottom: 12px;
        display: flex;
        align-items: center;

        &::before {
          content: '';
          width: 3px;
          height: 16px;
          background: #1989fa;
          margin-right: 8px;
          border-radius: 2px;
        }
      }
    }

    .health-basics {
      h3::before {
        background: #07c160; // 健康模块使用绿色标识
      }
    }

    .dreams-tracking {
      h3::before {
        background: #1989fa; // 梦想模块使用蓝色标识
      }
    }
  }
}
</style> 