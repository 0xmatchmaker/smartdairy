<template>
  <div class="settings-view">
    <!-- 现有设置内容 -->
    
    <!-- 添加版本信息 -->
    <van-cell-group inset class="version-info">
      <van-cell title="版本信息" :value="versionInfo" />
      <van-cell title="存储方式" :value="storageInfo" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { config } from '@/config'

const versionInfo = config.version === 'demo' ? '展示版' : '完整版'
const storageInfo = config.storage === 'indexeddb' ? '本地存储' : '云端存储'
</script> 