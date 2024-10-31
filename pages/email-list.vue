<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">邮件列表</h1>
      
      <div v-if="emails.length" class="space-y-4">
        <div v-for="email in emails" :key="email.id" 
          class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{{ email.subject }}</h3>
              <p class="text-sm text-gray-600">发件人：{{ email.from }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">{{ formatDate(email.date) }}</span>
              <button @click="syncBill(email)" 
                class="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors">
                同步
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-12">
        <p class="text-gray-500">暂无邮件</p>
      </div>
    </div>
    
    <!-- 添加密码输入弹窗 -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 class="text-lg font-medium mb-4">请输入解压密码</h3>
        <input 
          type="password"
          v-model="password"
          class="w-full px-3 py-2 border rounded mb-4"
          placeholder="请输入密码"
          @keyup.enter="confirmSync"
        />
        <div class="flex justify-end gap-3">
          <button 
            @click="showPasswordModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button 
            @click="confirmSync"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Email {
  id: string
  subject: string
  from: string
  date: string
  uidl: string
  // 根据实际数据结构添加其他字段
}

const emails = ref<Email[]>([])

onMounted(() => {
  const storedEmails = localStorage.getItem('emails')
  if (storedEmails) {
    emails.value = JSON.parse(storedEmails)
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 添加新的状态
const showPasswordModal = ref(false)
const password = ref('')
const currentEmail = ref<Email | null>(null)

// 修改 syncBill 函数
const syncBill = (email: Email) => {
  currentEmail.value = email
  showPasswordModal.value = true
  password.value = '' // 重置密码输入
}

// 添加确认同步函数
const confirmSync = async () => {
  if (!currentEmail.value || !password.value) return
  
  try {
    await fetch('/api/sync_bill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        uidl: currentEmail.value.uidl,
        password: password.value,
        sender: currentEmail.value.from
      }),
    })
    showPasswordModal.value = false
    // 可以添加成功提示
  } catch (error) {
    console.error('同步失败:', error)
    // 可以添加错误提示
  }
}
</script> 