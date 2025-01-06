<template>
  <div class="timeline">
    <!-- 当前时间显示 -->
    <div class="current-time-display">
      {{ currentTimeFormatted }}
    </div>

    <!-- 当前时间指示器 -->
    <div 
      class="current-time-indicator"
      :style="{ left: calculatePosition(currentTime) }"
    >
      <div class="indicator-line"></div>
      <div class="indicator-dot"></div>
    </div>

    <!-- 时间轴标尺 -->
    <div class="timeline-ruler">
      <div v-for="hour in 24" :key="hour" class="hour-mark">
        {{ (hour - 1).toString().padStart(2, '0') }}:00
      </div>
    </div>

    <!-- 预设时间点 -->
    <div class="preset-events">
      <van-button
        v-for="preset in presetTimePoints"
        :key="preset.time"
        size="small"
        :class="['preset-event', isEventMarked(preset) ? 'marked' : '']"
        :style="{ left: calculatePosition(preset.time) }"
        @click="toggleEvent(preset)"
      >
        {{ preset.title }}
      </van-button>
    </div>

    <!-- 自定义事件区域 -->
    <div class="custom-events" @click="handleTimelineClick">
      <div
        v-for="event in todayEvents"
        :key="event.id"
        class="event-marker"
        :style="{ left: calculatePosition(event.time) }"
        @click.stop="editEvent(event)"
      >
        {{ event.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { Dialog, showNotify } from 'vant'

interface TimelineEvent {
  id: string
  time: string
  title: string
  type: 'preset' | 'custom'
  note?: string
}

// 预设时间点
const presetTimePoints = [
  { time: '07:00', title: '起床' },
  { time: '08:00', title: '早餐' },
  { time: '12:00', title: '午餐' },
  { time: '14:00', title: '午休' },
  { time: '18:00', title: '晚餐' },
  { time: '22:00', title: '睡觉' }
]

const store = useDiaryStore()
const todayEvents = computed(() => store.getTodayEvents())

// 计算事件在时间轴上的位置
const calculatePosition = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const percentage = ((hours * 60 + minutes) / (24 * 60)) * 100
  return `${percentage}%`
}

// 检查事件是否已标记
const isEventMarked = (preset: { time: string; title: string }) => {
  return todayEvents.value.some(event => 
    event.time.endsWith(preset.time) && event.title === preset.title
  )
}

// 切换预设事件的标记状态
const toggleEvent = async (preset: { time: string; title: string }) => {
  const today = new Date().toISOString().split('T')[0]
  const eventTime = `${today}T${preset.time}`
  
  if (isEventMarked(preset)) {
    store.removeTimelineEvent(eventTime)
    showNotify({ type: 'warning', message: `取消提醒：${preset.title}` })
  } else {
    const note = await Dialog.prompt({
      title: '添加备注',
      message: '可以添加简短备注（选填）'
    })

    store.addTimelineEvent({
      id: Date.now().toString(),
      time: eventTime,
      type: 'preset',
      title: preset.title,
      note: note || undefined
    })
    showNotify({ type: 'success', message: `已设置提醒：${preset.title}` })
  }
}

// 处理时间轴点击，添加自定义事件
const handleTimelineClick = async (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percentage = (e.clientX - rect.left) / rect.width
  const totalMinutes = percentage * 24 * 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  
  const title = await Dialog.prompt({
    title: '添加事件',
    message: '请输入事件名称'
  })

  if (title) {
    const today = new Date().toISOString().split('T')[0]
    const time = `${today}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
    store.addTimelineEvent({
      id: Date.now().toString(),
      time,
      type: 'custom',
      title
    })
    showNotify({ type: 'success', message: `已添加事件：${title}` })
  }
}

// 编辑事件
const editEvent = async (event: TimelineEvent) => {
  const actions = ['编辑', '删除']
  const { selected } = await Dialog.select({
    title: event.title,
    message: event.note || '无备注',
    actions
  })

  if (selected === '删除') {
    store.removeTimelineEvent(event.time)
    showNotify({ type: 'success', message: '已删除事件' })
  } else if (selected === '编辑') {
    const note = await Dialog.prompt({
      title: '编辑备注',
      message: '修改备注内容',
      defaultValue: event.note
    })
    store.updateTimelineEvent({ ...event, note })
    showNotify({ type: 'success', message: '已更新事件' })
  }
}

// 添加当前时间相关的逻辑
const currentTime = ref('')
const currentTimeFormatted = ref('')

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  currentTime.value = `${hours}:${minutes}`
  currentTimeFormatted.value = `${hours}:${minutes}:${seconds}`
}

// 启动定时器，每秒更新一次时间
let timer: number
onMounted(() => {
  updateCurrentTime() // 立即更新一次
  timer = setInterval(updateCurrentTime, 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.timeline {
  position: relative;
  height: 120px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 8px;
  overflow: hidden;
  background: white;

  .timeline-ruler {
    position: relative;
    height: 20px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ebedf0;
    
    .hour-mark {
      font-size: 10px;
      color: #969799;
      transform: translateX(-50%);
    }
  }

  .preset-events,
  .custom-events {
    position: relative;
    height: 40px;
    margin-top: 8px;
  }

  .preset-event {
    position: absolute;
    transform: translateX(-50%);
    padding: 2px 8px;
    font-size: 12px;
    
    &.marked {
      background-color: #07c160;
      color: white;
    }
  }

  .event-marker {
    position: absolute;
    transform: translateX(-50%);
    background-color: #1989fa;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
  }

  // 添加当前时间显示样式
  .current-time-display {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1989fa;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
    z-index: 2;
  }

  // 添加当前时间指示器样式
  .current-time-indicator {
    position: absolute;
    top: 20px; // 从时间轴标尺底部开始
    bottom: 0;
    width: 2px;
    z-index: 1;
    pointer-events: none; // 防止干扰点击事件

    .indicator-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 2px;
      background-color: #ff4d4f;
      transform: translateX(-50%);
    }

    .indicator-dot {
      position: absolute;
      top: -4px;
      left: 50%;
      width: 8px;
      height: 8px;
      background-color: #ff4d4f;
      border-radius: 50%;
      transform: translateX(-50%);
      animation: pulse 2s infinite;
    }
  }
}

// 添加脉冲动画
@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
}
</style> 