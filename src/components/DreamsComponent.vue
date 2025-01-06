<template>
  <div class="dreams-component">
    <!-- 梦想标签列表 -->
    <div class="dreams-tags">
      <div 
        v-for="dream in dreams"
        :key="dream.id"
        class="dream-wrapper"
      >
        <van-tag
          :class="['dream-tag', dream.status]"
          @click="toggleDreamStatus(dream)"
        >
          {{ dream.title }}
          <template #right-icon>
            <van-icon :name="getStatusIcon(dream.status)" />
            <span v-if="dream.status === 'started'" class="duration">
              {{ calculateElapsedTime(dream.startTime!) }}
            </span>
          </template>
        </van-tag>
        <!-- 添加进度条 -->
        <van-progress
          :percentage="calculateProgress(dream)"
          :stroke-width="3"
          :show-pivot="true"
          :color="getProgressColor(dream)"
        >
          <template #pivot>
            {{ formatAccumulatedTime(dream.accumulatedSeconds) }}/{{ dream.dailyGoalMinutes }}分钟
          </template>
        </van-progress>
      </div>
    </div>

    <!-- 今日投入统计 -->
    <div class="daily-summary" v-if="hasDreamActivities">
      <h3>今日投入</h3>
      <div class="summary-list">
        <div 
          v-for="activity in todayActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-header">
            <span class="activity-title">{{ activity.title }}</span>
            <span class="activity-duration">{{ activity.duration }}</span>
          </div>
          <div class="activity-notes" v-if="activity.notes">
            {{ activity.notes }}
          </div>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 新想法记录区域 (移到底部) -->
    <div class="quick-idea-section">
      <van-button 
        block
        icon="bulb-o" 
        size="small"
        @click="showIdeaDialog = true"
      >
        <span class="idea-button-text">记录灵感想法...</span>
      </van-button>
    </div>

    <!-- 完成记录弹窗 -->
    <van-dialog
      v-model:show="showNoteDialog"
      title="记录心得"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <div class="note-input-wrapper">
        <van-field
          v-model="noteContent"
          type="textarea"
          placeholder="简单记录一下今天的收获..."
          rows="3"
          autosize
        />
        <!-- 快捷短语 -->
        <div class="quick-phrases">
          <van-tag
            v-for="phrase in quickPhrases"
            :key="phrase"
            size="medium"
            @click="appendPhrase(phrase)"
          >
            {{ phrase }}
          </van-tag>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <van-button plain @click="closeNoteDialog">取消</van-button>
          <van-button type="primary" @click="completeWithNotes">完成记录</van-button>
        </div>
      </template>
    </van-dialog>

    <!-- 新想法记录弹窗 -->
    <van-dialog
      v-model:show="showIdeaDialog"
      title="记录新想法"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <div class="note-input-wrapper">
        <van-field
          v-model="ideaContent"
          type="textarea"
          placeholder="写下你的新想法..."
          rows="3"
          autosize
        />
        <!-- 关联梦想选择 -->
        <div class="dream-selector">
          <span class="label">关联梦想：</span>
          <van-radio-group v-model="selectedDreamId" direction="horizontal">
            <van-radio 
              v-for="dream in dreams" 
              :key="dream.id" 
              :name="dream.id"
            >
              {{ dream.title }}
            </van-radio>
          </van-radio-group>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <van-button plain @click="showIdeaDialog = false">取消</van-button>
          <van-button type="primary" @click="saveNewIdea">保存想法</van-button>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { showNotify } from 'vant'

interface DreamActivity {
  id: string
  title: string
  duration: string
  notes?: string
  timestamp: string
}

interface Dream {
  id: string
  title: string
  status: 'pending' | 'started' | 'completed'
  startTime?: string
  endTime?: string
  dailyGoalMinutes: number  // 每日目标分钟数
  accumulatedSeconds: number // 当天累计秒数
}

const store = useDiaryStore()
const dreams = computed(() => store.dreams)

// 今日活动记录
const todayActivities = ref<DreamActivity[]>([])

// 弹窗相关
const showNoteDialog = ref(false)
const noteContent = ref('')
const currentDream = ref<Dream | null>(null)

// 快捷短语
const quickPhrases = [
  '今天很有收获',
  '遇到了一些困难',
  '需要继续努力',
  '有了新的想法',
  '感觉不错'
]

// 计算是否有今日活动
const hasDreamActivities = computed(() => todayActivities.value.length > 0)

// 获取状态图标
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'started':
      return 'play-circle-o'
    case 'completed':
      return 'checked'
    default:
      return 'clock-o'
  }
}

// 切换梦想状态
const toggleDreamStatus = (dream: Dream) => {
  const now = new Date()
  const timeStr = now.toISOString()

  if (dream.status === 'pending' || dream.status === 'completed') {
    // 开始追踪（允许已完成的任务重新开始）
    dream.status = 'started'
    dream.startTime = timeStr
    showNotify({ type: 'primary', message: `开始${dream.title}` })
    
    store.addTimelineEvent({
      id: Date.now().toString(),
      time: timeStr,
      title: '💫',
      type: 'dream',
      category: 'dream-start',
      note: dream.title
    })
  } else if (dream.status === 'started') {
    // 准备完成，显示记录弹窗
    currentDream.value = dream
    noteContent.value = ''
    showNoteDialog.value = true
  }
}

// 添加快捷短语
const appendPhrase = (phrase: string) => {
  if (noteContent.value) {
    noteContent.value += '\n'
  }
  noteContent.value += phrase
}

// 处理弹窗关闭
const handleDialogClose = (action: string) => {
  if (action === 'confirm') {
    completeWithNotes()
  }
  return true
}

// 关闭弹窗
const closeNoteDialog = () => {
  showNoteDialog.value = false
  noteContent.value = ''
  currentDream.value = null
}

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

// 格式化持续时间（精确到秒）
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

// 格式化累计时间
const formatAccumulatedTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}`
}

// 获取进度条颜色
const getProgressColor = (dream: Dream) => {
  const progress = calculateProgress(dream)
  if (progress >= 100) return '#07c160'
  if (progress >= 50) return '#1989fa'
  return '#f2f3f5'
}

// 完成并记录笔记
const completeWithNotes = () => {
  try {
    if (!currentDream.value) {
      console.error('No current dream found')
      return
    }

    const dream = currentDream.value
    const now = new Date()
    const timeStr = now.toISOString()
    dream.endTime = timeStr

    // 计算本次持续时间并累加
    const start = new Date(dream.startTime!)
    const end = new Date(timeStr)
    const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)
    dream.accumulatedSeconds += durationSeconds

    const duration = formatDuration(dream.startTime!, dream.endTime)
    const progress = calculateProgress(dream)
    
    // 添加到今日活动
    todayActivities.value.push({
      id: Date.now().toString(),
      title: dream.title,
      duration,
      progress,
      notes: noteContent.value.trim() || undefined,
      timestamp: timeStr
    })

    // 添加到时间轴
    store.addTimelineEvent({
      id: Date.now().toString(),
      time: timeStr,
      title: '🌟',
      type: 'dream',
      category: 'dream-complete',
      note: `${dream.title}：${duration}\n累计完成${formatAccumulatedTime(dream.accumulatedSeconds)}/${dream.dailyGoalMinutes}分钟 (${progress}%)\n${noteContent.value || ''}`
    })

    // 添加到日记
    store.addDiaryEntry({
      id: Date.now().toString(),
      type: 'dream',
      title: dream.title,
      content: `投入${dream.title}：${duration}\n累计完成${formatAccumulatedTime(dream.accumulatedSeconds)}/${dream.dailyGoalMinutes}分钟 (${progress}%)\n${noteContent.value ? `心得：${noteContent.value}` : ''}`
    })

    showNotify({ 
      type: progress >= 100 ? 'success' : 'primary',
      message: progress >= 100 
        ? `太棒了！${dream.title}今日目标已达成！` 
        : `完成${dream.title}：${duration}，继续加油！`
    })

    // 重置状态但保留累计时间
    dream.status = 'pending'
    dream.startTime = undefined
    dream.endTime = undefined

    closeNoteDialog()
  } catch (error) {
    console.error('Error in completeWithNotes:', error)
    showNotify({ type: 'danger', message: '保存失败，请重试' })
  }
}

// 添加计算进度的函数
const calculateProgress = (dream: Dream) => {
  const goalSeconds = dream.dailyGoalMinutes * 60
  const progress = Math.min((dream.accumulatedSeconds / goalSeconds) * 100, 100)
  return Math.round(progress)
}

// 新想法相关的状态
const showIdeaDialog = ref(false)
const ideaContent = ref('')
const selectedDreamId = ref('')

// 保存新想法
const saveNewIdea = () => {
  try {
    if (!ideaContent.value.trim()) {
      showNotify({ type: 'warning', message: '请输入想法内容' })
      return
    }

    const now = new Date()
    const timeStr = now.toISOString()
    const selectedDream = dreams.value.find(d => d.id === selectedDreamId.value)
    const dreamTitle = selectedDream ? `【${selectedDream.title}】` : ''

    // 添加到时间轴
    store.addTimelineEvent({
      id: Date.now().toString(),
      time: timeStr,
      title: '💡',
      type: 'dream-idea',
      category: 'new-idea',
      note: `${dreamTitle}新想法：${ideaContent.value}`
    })

    // 添加到日记
    store.addDiaryEntry({
      id: Date.now().toString(),
      type: 'dream-idea',
      title: '新想法记录',
      content: `${dreamTitle}${ideaContent.value}`,
      timestamp: timeStr
    })

    showNotify({ type: 'success', message: '想法已记录' })
    
    // 重置状态
    ideaContent.value = ''
    selectedDreamId.value = ''
    showIdeaDialog.value = false
  } catch (error) {
    console.error('Error saving new idea:', error)
    showNotify({ type: 'danger', message: '保存失败，请重试' })
  }
}
</script>

<style scoped lang="scss">
.dreams-component {
  .dreams-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    .dream-wrapper {
      margin-bottom: 12px;
      
      .dream-tag {
        margin-bottom: 4px;
      }

      .van-progress {
        margin-left: 4px;
      }
    }

    .dream-tag {
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #ebedf0;
      
      &.pending {
        background: white;
        color: #666;
      }
      
      &.started {
        background: #e8f3ff;
        color: #1989fa;
        border-color: #1989fa;
      }
      
      &.completed {
        background: #1989fa;
        color: white;
        border-color: #1989fa;
      }

      .van-icon {
        margin-left: 4px;
      }

      &::before {
        content: '✨';
        margin-right: 4px;
        font-size: 12px;
      }
    }

    .van-progress {
      background: #e8f3ff;
    }
  }

  .daily-summary {
    background: white;
    border-radius: 8px;
    padding: 16px;

    h3 {
      font-size: 14px;
      color: #323233;
      margin-bottom: 12px;
    }

    .activity-item {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebedf0;

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .activity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .activity-title {
          font-weight: 500;
        }

        .activity-duration {
          color: #1989fa;
          font-size: 13px;
        }
      }

      .activity-notes {
        font-size: 13px;
        color: #666;
        line-height: 1.5;
        white-space: pre-wrap;
      }
    }
  }

  .note-input-wrapper {
    padding: 16px;

    .quick-phrases {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;

      .van-tag {
        cursor: pointer;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    
    .van-button {
      flex: 1;
      margin: 0 8px;
    }
  }

  .new-idea-button {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;

    .van-button {
      background: #fff;
      color: #1989fa;
      border: 1px solid #1989fa;
      
      &:active {
        background: #e8f3ff;
      }
    }
  }

  .dream-selector {
    margin-top: 16px;
    padding: 0 16px;

    .label {
      display: block;
      color: #323233;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .van-radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  }

  .divider {
    height: 8px;
    margin: 16px -16px;
    background-color: #f7f8fa;
  }

  .quick-idea-section {
    margin-top: 16px;
    
    .van-button {
      height: 40px;
      background: #fff;
      border: 1px dashed #dcdee0;
      border-radius: 8px;
      
      &:active {
        background: #f7f8fa;
      }

      .idea-button-text {
        color: #969799;
        margin-left: 4px;
      }

      .van-icon {
        color: #969799;
      }
    }
  }
}

@keyframes breathing {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style> 