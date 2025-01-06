<template>
  <van-popup
    :show="modelValue"
    position="bottom"
    round
    :style="{ height: '70%' }"
    @update:show="$emit('update:modelValue', $event)"
  >
    <div class="quick-note-panel">
      <van-nav-bar
        title="快速记录"
        left-text="取消"
        right-text="保存"
        @click-left="onClose"
        @click-right="saveNote"
      />

      <div class="content">
        <!-- 记录类型选择 -->
        <van-radio-group v-model="noteType">
          <van-space direction="horizontal" wrap>
            <van-radio name="text">文字</van-radio>
            <van-radio name="voice">语音</van-radio>
            <van-radio name="template">模板</van-radio>
          </van-space>
        </van-radio-group>

        <!-- 文字输入区域 -->
        <template v-if="noteType === 'text'">
          <van-field
            v-model="noteContent"
            type="textarea"
            placeholder="写下你的想法..."
            rows="4"
            autosize
          />
        </template>

        <!-- 语音输入区域 -->
        <template v-if="noteType === 'voice'">
          <div class="voice-input">
            <van-button
              round
              block
              type="primary"
              :loading="isRecording"
              @touchstart="startRecording"
              @touchend="stopRecording"
            >
              {{ isRecording ? '松开结束' : '按住说话' }}
            </van-button>
          </div>
        </template>

        <!-- 模板选择区域 -->
        <template v-if="noteType === 'template'">
          <van-radio-group v-model="selectedTemplate">
            <van-cell-group inset>
              <van-cell
                v-for="template in templates"
                :key="template.id"
                :title="template.title"
                clickable
                @click="selectTemplate(template)"
              >
                <template #right-icon>
                  <van-radio :name="template.id" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </template>

        <!-- 标签选择 -->
        <van-field
          v-model="tags"
          label="标签"
          placeholder="添加标签，用逗号分隔"
        />
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDiaryStore } from '@/stores/diaryStore'
import type { QuickNote } from '@/types/diary'
import { showSuccessToast } from 'vant'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const store = useDiaryStore()

// 记录相关状态
const noteType = ref<'text' | 'voice' | 'template'>('text')
const noteContent = ref('')
const tags = ref('')
const isRecording = ref(false)
const selectedTemplate = ref('')

// 预设模板
const templates = [
  { id: '1', title: '今日总结', content: '今天我...' },
  { id: '2', title: '情绪记录', content: '此刻我感觉...' },
  { id: '3', title: '计划制定', content: '接下来我要...' },
]

// 选择模板
const selectTemplate = (template: typeof templates[0]) => {
  noteContent.value = template.content
}

// 开始录音
const startRecording = () => {
  isRecording.value = true
  // TODO: 实现录音功能
}

// 结束录音
const stopRecording = () => {
  isRecording.value = false
  // TODO: 实现录音功能
}

// 保存笔记
const saveNote = useDebounceFn(() => {
  const newNote: QuickNote = {
    id: Date.now().toString(),
    content: noteContent.value,
    type: noteType.value,
    tags: tags.value.split(',').map(tag => tag.trim()).filter(Boolean),
    createdAt: new Date().toISOString()
  }

  store.addQuickNote(newNote)
  showSuccessToast('保存成功')
  onClose()
}, 300)

// 关闭面板
const onClose = () => {
  emit('update:modelValue', false)
  // 重置表单
  noteContent.value = ''
  tags.value = ''
  noteType.value = 'text'
  selectedTemplate.value = ''
}
</script>

<style scoped lang="scss">
.quick-note-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;

    .voice-input {
      margin: 32px 0;
      text-align: center;
    }
  }
}
</style> 