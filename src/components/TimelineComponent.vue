<template>
  <div class="timeline">
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
import { computed, ref } from 'vue'
import { useDiaryStore } from '@/stores/diaryStore'
import type { TimelineEvent } from '@/types/diary'
import { Dialog } from 'vant'

const store = useDiaryStore()

// 获取今天的事件
const todayEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return store.timelineEvents.filter(event => event.time.startsWith(today))
})

// 计算事件在时间轴上的位置
const calculatePosition = (time: string) => {
  const hours = parseInt(time.split(':')[0])
  const minutes = parseInt(time.split(':')[1])
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
    // 移除事件
    store.removeTimelineEvent(eventTime)
  } else {
    // 添加事件
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
  }
}
</script>

<style scoped lang="scss">
.timeline {
  position: relative;
  height: 120px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  padding: 8px;
  overflow: hidden;

  .timeline-ruler {
    position: relative;
    height: 20px;
    display: flex;
    justify-content: space-between;
    
    .hour-mark {
      font-size: 12px;
      color: #999;
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
}
</style> 