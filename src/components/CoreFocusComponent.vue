<template>
  <div class="core-focus">
    <!-- 健康任务追踪 -->
    <div class="health-tasks">
      <van-tag
        v-for="task in healthTasks"
        :key="task.id"
        :class="['health-tag', task.status]"
        @click="toggleTaskStatus(task)"
      >
        {{ task.title }}
        <template #right-icon>
          <van-icon :name="getTaskIcon(task.status)" />
          <span v-if="task.status === 'started'" class="duration">
            {{ calculateElapsedTime(task.startTime!) }}
          </span>
        </template>
      </van-tag>
    </div>

    <!-- 今日完成情况 -->
    <div class="completion-summary" v-if="hasCompletedTasks">
      <h3>今日完成</h3>
      <div class="completion-list">
        <div 
          v-for="task in completedTasks" 
          :key="task.id" 
          class="completion-item"
        >
          <span class="task-title">{{ task.title }}</span>
          <span class="task-duration">{{ formatDuration(task.startTime!, task.endTime!) }}</span>
        </div>
      </div>
    </div>

    <!-- 今日核心内容 -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { showNotify } from 'vant'

interface HealthTask {
  id: string
  title: string
  status: 'pending' | 'started' | 'completed'
  startTime?: string
  endTime?: string
}

const store = useDiaryStore()
const focusContent = ref('')

// 修改预设任务，去掉具体时间要求
const healthTasks = ref<HealthTask[]>([
  { id: '1', title: '喝水', status: 'pending' },
  { id: '2', title: '运动', status: 'pending' },
  { id: '3', title: '站立工作', status: 'pending' },
  { id: '4', title: '眼部放松', status: 'pending' },
  { id: '5', title: '正念冥想', status: 'pending' },
  { id: '6', title: '伸展运动', status: 'pending' }
])

// 获取任务状态对应的图标
const getTaskIcon = (status: string) => {
  switch (status) {
    case 'started':
      return 'play-circle-o'
    case 'completed':
      return 'checked'
    default:
      return 'clock-o'
  }
}

// 计算已完成的任务
const completedTasks = computed(() => {
  return healthTasks.value.filter(task => task.status === 'completed')
})

const hasCompletedTasks = computed(() => completedTasks.value.length > 0)

// 计算进行中任务的持续时间（精确到秒）
const calculateElapsedTime = (startTime: string) => {
  const start = new Date(startTime)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const remainingSeconds = seconds % 60
    return `${minutes}m${remainingSeconds}s`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60
  return `${hours}h${remainingMinutes}m${remainingSeconds}s`
}

// 格式化完成时间（精确到秒）
const formatDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = end.getTime() - start.getTime()
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) {
    return `${seconds}秒`
  }
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60
  return `${hours}小时${remainingMinutes}分${remainingSeconds}秒`
}

// 更新进行中任务的显示时间（改为每秒更新）
let elapsedTimer: number
const updateElapsedTime = () => {
  healthTasks.value = [...healthTasks.value]
}

// 切换任务状态
const toggleTaskStatus = (task: HealthTask) => {
  const now = new Date()
  const timeStr = now.toISOString()

  switch (task.status) {
    case 'pending':
      task.status = 'started'
      task.startTime = timeStr
      showNotify({ type: 'primary', message: `开始${task.title}` })
      
      // 在时间轴上添加小标记
      store.addTimelineEvent({
        id: Date.now().toString(),
        time: timeStr,
        title: '▶',
        type: 'health',
        category: 'health-task-start',
        note: task.title
      })

      // 启动计时器更新显示时间（改为每秒更新）
      if (!elapsedTimer) {
        elapsedTimer = setInterval(updateElapsedTime, 1000)
      }
      break

    case 'started':
      task.status = 'completed'
      task.endTime = timeStr
      const duration = formatDuration(task.startTime!, timeStr)
      showNotify({ type: 'success', message: `完成${task.title}：${duration}` })
      
      store.addTimelineEvent({
        id: Date.now().toString(),
        time: timeStr,
        title: '✓',
        type: 'health',
        category: 'health-task-complete',
        note: `${task.title}：${duration}`
      })

      store.addDiaryEntry({
        id: Date.now().toString(),
        type: 'health',
        title: task.title,
        content: `完成${task.title}，持续时间：${duration}`,
        timestamp: timeStr
      })
      break

    case 'completed':
      return
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (elapsedTimer) {
    clearInterval(elapsedTimer)
  }
})

// 重置每日任务状态
const resetDailyTasks = () => {
  healthTasks.value.forEach(task => {
    task.status = 'pending'
    task.startTime = undefined
    task.endTime = undefined
  })
}

// 在午夜自动重置任务
const scheduleReset = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime()
  setTimeout(() => {
    resetDailyTasks()
    scheduleReset() // 设置下一天的重置
  }, timeUntilMidnight)
}

// 组件挂载时设置重置定时器
onMounted(() => {
  scheduleReset()
})
</script>

<style scoped lang="scss">
.core-focus {
  .health-tasks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    .health-tag {
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 16px;
      
      &.pending {
        background-color: #f2f3f5;
        color: #666;
      }
      
      &.started {
        background-color: #e8f3ff;
        color: #1989fa;
        animation: breathing 2s infinite;

        .duration {
          margin-left: 4px;
          font-size: 12px;
          opacity: 0.8;
        }
      }
      
      &.completed {
        background-color: #e8f8f2;
        color: #07c160;
      }

      .van-icon {
        margin-left: 4px;
      }
    }
  }

  .completion-summary {
    margin: 16px 0;
    padding: 12px;
    background-color: #f7f8fa;
    border-radius: 8px;

    h3 {
      font-size: 14px;
      color: #323233;
      margin-bottom: 8px;
    }

    .completion-list {
      .completion-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        font-size: 13px;
        
        .task-title {
          color: #323233;
        }
        
        .task-duration {
          color: #07c160;
          font-family: monospace;
        }
      }
    }
  }
}

@keyframes breathing {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style> 