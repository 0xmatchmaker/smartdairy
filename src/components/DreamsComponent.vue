<template>
  <div class="dreams">
    <!-- 梦想列表 -->
    <div class="dreams-list">
      <van-collapse v-model="activeNames">
        <van-collapse-item
          v-for="dream in dreams"
          :key="dream.id"
          :title="dream.title"
          :name="dream.id"
        >
          <div class="dream-content">
            <p class="description">{{ dream.description }}</p>
            
            <!-- 进度条 -->
            <van-progress
              :percentage="dream.progress"
              :color="getProgressColor(dream.progress)"
            />
            
            <!-- 里程碑列表 -->
            <div class="milestones">
              <van-checkbox-group v-model="dream.milestones">
                <van-cell-group inset>
                  <van-cell
                    v-for="milestone in dream.milestones"
                    :key="milestone.id"
                  >
                    <template #title>
                      <van-checkbox
                        :name="milestone.id"
                        @change="updateMilestone(dream.id, milestone.id, $event)"
                      >
                        {{ milestone.title }}
                      </van-checkbox>
                    </template>
                  </van-cell>
                </van-cell-group>
              </van-checkbox-group>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 添加梦想按钮 -->
    <van-button
      round
      block
      type="primary"
      @click="showAddDreamDialog"
      style="margin-top: 16px"
    >
      添加新梦想
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDiaryStore } from '@/stores/diaryStore'
import type { Dream } from '@/types/diary'
import { Dialog, showSuccessToast } from 'vant'

const store = useDiaryStore()
const activeNames = ref<string[]>([])

// 获取梦想列表
const dreams = computed(() => store.dreams)

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress < 30) return '#ee0a24'
  if (progress < 70) return '#ff976a'
  return '#07c160'
}

// 更新里程碑状态
const updateMilestone = (dreamId: string, milestoneId: string, completed: boolean) => {
  store.updateDreamMilestone(dreamId, milestoneId, completed)
  updateDreamProgress(dreamId)
}

// 计算并更新梦想进度
const updateDreamProgress = (dreamId: string) => {
  const dream = dreams.value.find(d => d.id === dreamId)
  if (dream) {
    const total = dream.milestones.length
    const completed = dream.milestones.filter(m => m.completed).length
    const progress = Math.round((completed / total) * 100)
    store.updateDreamProgress(dreamId, progress)
  }
}

// 显示添加梦想对话框
const showAddDreamDialog = async () => {
  try {
    const title = await Dialog.prompt({
      title: '添加新梦想',
      message: '请输入梦想标题'
    })

    const description = await Dialog.prompt({
      title: '梦想描述',
      message: '请描述你的梦想'
    })

    const newDream: Dream = {
      id: Date.now().toString(),
      title,
      description,
      targetDate: new Date().toISOString().split('T')[0],
      progress: 0,
      milestones: []
    }

    store.addDream(newDream)
    showSuccessToast('添加成功')
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped lang="scss">
.dreams {
  .dream-content {
    padding: 8px 0;

    .description {
      color: #666;
      margin-bottom: 12px;
    }

    .milestones {
      margin-top: 16px;
    }
  }
}
</style> 