<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <div class="container mx-auto px-4 py-16">
      <!-- 标题部分 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">账单同步助手</h1>
        <p class="text-lg text-gray-600">轻松同步支付宝、微信账单至 Notion</p>
      </div>
      
    
      
      <!-- 功能特点 -->
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white p-6 rounded-xl shadow-md">
          <div class="text-green-500 mb-4">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold mb-2">自动导入</h2>
          <p class="text-gray-600">支持账单文件自动解析导入，无需手动整理</p>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-md">
          <div class="text-green-500 mb-4">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold mb-2">多平台合并</h2>
          <p class="text-gray-600">将支付宝、微信账单统一整理到 Notion</p>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-md">
          <div class="text-green-500 mb-4">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold mb-2">数据模板</h2>
          <p class="text-gray-600">预设 Notion 数据库模板，开箱即用</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="text-center space-y-4">
        <NuxtLink 
          to="/setting"
          class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg inline-block font-medium transition-colors"
        >
          开始导入账单
        </NuxtLink>
        <div>
          <a 
            href="https://github.com/zhaijunxiao/Notion-Bill" 
            target="_blank"
            class="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            👉 查看使用教程
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 无需添加额外的脚本代码
</script>

<style>
/* 样式已通过 Tailwind 类名实现 */
</style>