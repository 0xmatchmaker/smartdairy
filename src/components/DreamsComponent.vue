<template>
  <div class="dreams-component">
    <!-- 梦想卡片 -->
    <div 
      v-for="dream in dreams" 
      :key="dream.id"
      class="dream-card"
      @click="startTracking(dream)"
      @dblclick="openDreamDetail(dream)"
    >
      <div class="dream-header">
        <span class="dream-title">{{ dream.title }}</span>
        <van-tag :type="getProgressType(dream)">
          {{ formatProgress(dream) }}
        </van-tag>
      </div>
      <van-progress 
        :percentage="calculateProgress(dream)" 
        :color="getProgressColor(dream)"
      />
    </div>

    <!-- 计时弹窗 -->
    <van-popup
      v-model:show="showTimer"
      position="bottom"
      :style="{ height: '30%' }"
    >
      <div class="timer-content">
        <h3>{{ currentDream?.title }}</h3>
        <div class="timer">{{ formatTime(timerSeconds) }}</div>
        <van-button 
          type="primary" 
          block 
          @click="stopTracking"
        >
          完成
        </van-button>
      </div>
    </van-popup>

    <!-- 详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      :style="{ height: '50%' }"
    >
      <div class="detail-content">
        <van-nav-bar
          :title="currentDream?.title"
          left-text="返回"
          @click-left="showDetail = false"
        />
        
        <div class="detail-form">
          <van-field
            v-model="note"
            type="textarea"
            label="记录感受"
            placeholder="今天的感受和想法..."
            rows="3"
            autosize
          />
          
          <van-cell-group inset>
            <van-cell title="关联思考">
              <template #value>
                <van-radio-group v-model="relatedThoughts" direction="horizontal">
                  <van-space wrap>
                    <van-radio name="学习编程">学习编程</van-radio>
                    <van-radio name="健身计划">健身计划</van-radio>
                    <van-radio name="阅读">阅读</van-radio>
                    <van-radio name="写作">写作</van-radio>
                  </van-space>
                </van-radio-group>
              </template>
            </van-cell>
          </van-cell-group>

          <div class="submit-btn">
            <van-button type="primary" block @click="saveDetail">
              保存记录
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { showToast } from 'vant'

const store = useDiaryStore()
const dreams = computed(() => store.getActiveDreams)

const showTimer = ref(false)
const showDetail = ref(false)
const timerSeconds = ref(0)
const currentDream = ref<any>(null)
const note = ref('')
const relatedThoughts = ref('')
let timerInterval: number | null = null

function startTracking(dream: any) {
  currentDream.value = dream
  showTimer.value = true
  timerSeconds.value = 0
  timerInterval = setInterval(() => {
    timerSeconds.value++
  }, 1000)
}

function stopTracking() {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  if (currentDream.value) {
    store.updateDreamProgress(currentDream.value.id, timerSeconds.value)
    showToast('记录已保存')
  }
  showTimer.value = false
  currentDream.value = null
  timerSeconds.value = 0
}

function openDreamDetail(dream: any) {
  currentDream.value = dream
  note.value = ''
  relatedThoughts.value = ''
  showDetail.value = true
}

function saveDetail() {
  if (!note.value.trim()) {
    showToast('请记录一些感受')
    return
  }

  const entry = {
    id: Date.now().toString(),
    type: 'dream_note',
    content: note.value,
    relatedThoughts: relatedThoughts.value,
    dreamId: currentDream.value?.id,
    timestamp: new Date().toISOString()
  }

  store.addDiaryEntry(entry)
  showToast('记录已保存')
  showDetail.value = false
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// ... 其他辅助函数
</script>

<style scoped lang="scss">
.dreams-component {
  padding: 16px;
}

.dream-card {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  &:active {
    background: #e8f8f2;
  }
}

.timer-content {
  padding: 20px;
  text-align: center;
  
  .timer {
    font-size: 32px;
    margin: 20px 0;
  }
}

.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .detail-form {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  
  .submit-btn {
    margin-top: 24px;
  }
}
</style> 