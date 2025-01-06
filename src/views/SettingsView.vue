<template>
  <div class="settings-view">
    <h2>设置</h2>
    
    <section class="encryption-settings">
      <h3>加密设置</h3>
      
      <van-cell-group inset>
        <van-field
          v-model="password"
          type="password"
          label="日记密码"
          placeholder="设置密码后将加密新内容"
          @change="handlePasswordChange"
        />
      </van-cell-group>

      <div class="settings-tips" v-if="hasPassword">
        <van-tag type="warning">请记住密码，忘记密码将无法查看加密内容</van-tag>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { keyManager } from '@/services/key-manager'

const password = ref('')
const hasPassword = computed(() => keyManager.hasPassword())

function handlePasswordChange(value: string) {
  if (!value) {
    keyManager.clear()
    showToast('已清除密码')
    return
  }
  
  keyManager.setPassword(value)
  showToast('密码设置成功')
}
</script>

<style scoped>
.settings-view {
  padding: 16px;
}

.encryption-settings {
  margin-top: 24px;
}

.settings-tips {
  margin-top: 16px;
  padding: 8px;
}
</style> 