<template>
  <div class="timeline-component">
    <van-empty v-if="!timelineItems.length" description="今天还没有记录" />
    
    <div v-else class="timeline">
      <!-- 今日目标完成度 -->
      <div class="timeline-item">
        <div class="daily-summary">
          <h3>今日目标完成度</h3>
          <div class="goals-grid">
            <div 
              v-for="dream in dreams" 
              :key="dream.id" 
              class="goal-card"
            >
              <span class="goal-title">{{ dream.title }}</span>
              <van-progress 
                :percentage="calculateProgress(dream)"
                :color="getProgressColor(dream)"
              />
              <span class="goal-time">
                {{ formatTime(dream.accumulatedSeconds) }}/
                {{ dream.dailyGoalMinutes }}分钟
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间轴条目 -->
      <div 
        v-for="item in timelineItems" 
        :key="item.id"
        class="timeline-item"
      >
        <div class="timeline-dot">
          <van-icon 
            :name="getItemIcon(item.type)"
            :color="getItemColor(item.type)"
          />
        </div>
        <div class="timeline-content">
          <span class="time">{{ formatTimeString(item.timestamp) }}</span>
          <div class="content">
            <h4>{{ getItemTitle(item) }}</h4>
            <p>{{ item.content }}</p>
            <van-tag 
              v-if="item.relatedThoughts"
              type="primary" 
              size="medium"
            >
              关联：{{ item.relatedThoughts }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { formatTimeString } from '../utils/date'

const store = useDiaryStore()

// 添加日志
onMounted(() => {
  console.log('Timeline mounted, entries:', store.diaryEntries)
})

const timelineItems = computed(() => {
  console.log('Computing timeline items:', store.diaryEntries) // 添加日志
  return store.diaryEntries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const dreams = computed(() => store.dreams)

function calculateProgress(dream: any) {
  const goalSeconds = dream.dailyGoalMinutes * 60
  return Math.min(Math.round((dream.accumulatedSeconds / goalSeconds) * 100), 100)
}

function getProgressColor(dream: any) {
  const progress = calculateProgress(dream)
  if (progress >= 100) return '#07c160'
  return '#1989fa'
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getItemIcon(type: string) {
  switch (type) {
    case 'dream_note': return 'star'
    case 'quick_note': return 'edit'
    default: return 'clock-o'
  }
}

function getItemColor(type: string) {
  switch (type) {
    case 'dream_note': return '#ff976a'
    case 'quick_note': return '#07c160'
    default: return '#1989fa'
  }
}

function getItemTitle(item: any) {
  switch (item.type) {
    case 'dream_note': return '梦想追踪记录'
    case 'quick_note': return '快速笔记'
    default: return '日记记录'
  }
}
</script>

<style scoped lang="scss">
.timeline-component {
  padding: 16px;
}

.timeline {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #ebedf0;
  }
}

.timeline-item {
  position: relative;
  padding-left: 40px;
  margin-bottom: 20px;
}

.timeline-dot {
  position: absolute;
  left: 8px;
  top: 0;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-content {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.daily-summary {
  h3 {
    margin: 0 0 12px;
    color: #323233;
  }
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.goal-card {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  
  .goal-title {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .goal-time {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #969799;
  }
}

.timeline-item {
  .time {
    font-size: 12px;
    color: #969799;
  }
  
  .content {
    margin-top: 8px;
    
    h4 {
      margin: 0 0 4px;
      color: #323233;
    }
    
    p {
      margin: 0 0 8px;
      color: #646566;
    }
  }
}
</style> 