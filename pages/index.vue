<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">账单同步助手</h1>
    
    <div class="mb-6">
      <p class="mb-2">这个工具可以帮助你:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>自动同步多个平台的账单</li>
        <li>统一管理所有收支记录</li>
        <li>导出统计数据</li>
      </ul>
    </div>

    <NuxtLink 
      to="/setting"
      class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-block"
    >
      开始同步账单
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
// 无需添加额外的脚本代码
</script>

<style>
/* 样式已通过 Tailwind 类名实现 */
</style>