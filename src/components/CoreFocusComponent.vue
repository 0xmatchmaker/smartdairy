<template>
  <div class="core-focus">
    <van-form @submit="saveFocus">
      <van-cell-group inset>
        <!-- 今日改变 -->
        <van-field
          v-model="focusData.changes"
          label="今日改变"
          type="textarea"
          placeholder="今天有什么不一样？"
          :rules="[{ required: true, message: '请填写今日改变' }]"
        />

        <!-- 外部期待 -->
        <van-field
          v-model="focusData.expectedFromOthers"
          label="外部期待"
          type="textarea"
          placeholder="他人对你有什么期待？"
          :rules="[{ required: true, message: '请填写外部期待' }]"
        />

        <!-- 个人期待 -->
        <van-field
          v-model="focusData.personalExpectations"
          label="个人期待"
          type="textarea"
          placeholder="你对自己有什么期待？"
          :rules="[{ required: true, message: '请填写个人期待' }]"
        />

        <!-- 重要事项 -->
        <van-field
          v-model="focusData.importantMatters"
          label="重要事项"
          type="textarea"
          placeholder="最重要的是什么？"
          :rules="[{ required: true, message: '请填写重要事项' }]"
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit">
          保存
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDiaryStore } from '@/stores/diaryStore'
import type { CoreFocus } from '@/types/diary'
import { showSuccessToast } from 'vant'

const store = useDiaryStore()

// 表单数据
const focusData = ref<CoreFocus>({
  date: new Date().toISOString().split('T')[0],
  changes: '',
  expectedFromOthers: '',
  personalExpectations: '',
  importantMatters: ''
})

// 加载今天的数据
onMounted(() => {
  const todayFocus = store.coreFocus
  if (todayFocus && todayFocus.date === focusData.value.date) {
    focusData.value = { ...todayFocus }
  }
})

// 保存数据
const saveFocus = () => {
  store.updateCoreFocus(focusData.value)
  showSuccessToast('保存成功')
}
</script>

<style scoped lang="scss">
.core-focus {
  .van-cell-group {
    margin-bottom: 16px;
  }

  .van-field {
    margin-bottom: 8px;
  }
}
</style> 