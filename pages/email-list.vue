<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">邮件列表</h1>
      
      <!-- 使用 grid 创建两列布局 -->
      <div class="grid grid-cols-2 gap-6">
        <!-- 左侧邮件列表 -->
        <div class="bg-white rounded-lg shadow p-4">
          <h2 class="text-lg font-medium mb-4">待处理邮件</h2>
          <div class="overflow-y-auto max-h-[calc(100vh-240px)]">
            <div v-if="emails.length" class="space-y-4">
              <div v-for="email in emails" :key="email.id" 
                class="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
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
        </div>

        <!-- 右侧处理日志 -->
        <div class="bg-white rounded-lg shadow p-4">
          <h2 class="text-lg font-medium mb-4">处理日志</h2>
          <div class="overflow-y-auto max-h-[calc(100vh-240px)]">
            <div v-if="logs.length" class="space-y-3">
              <div v-for="log in logs" :key="log.id" 
                class="p-3 rounded-lg text-sm"
                :class="getLogStatusClass(log.status)">
                <div class="flex justify-between">
                  <span>{{ log.message }}</span>
                  <span class="text-gray-500">{{ formatDate(log.timestamp) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <p class="text-gray-500">暂无处理日志</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 密码弹窗保持不变 -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 class="text-lg font-medium mb-4">请输入解压密码</h3>
        <input 
          type="text"
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
import { useSettingsStore } from '~/stores/settings'
import { useMyEmailtopStore } from '~/stores/emailtop'
import type { EmailTop } from '~/stores/emailtop'

const emails = ref<EmailTop[]>([])

onMounted(() => {
  const emailtopStore = useMyEmailtopStore()
  if (emailtopStore.emails) {
    emails.value = emailtopStore.emails
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
const currentEmail = ref<EmailTop | null>(null)

// 使用 store
const settingsStore = useSettingsStore()
// store 中的值会自动持久化，不需要额外的保存操作

// 添加日志相关的类型和状态
interface Log {
  id: string
  message: string
  status: 'success' | 'error' | 'pending'
  timestamp: string
}

// 添加日志列表
const logs = ref<Log[]>([])

// 添加日志状态样式函数
const getLogStatusClass = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-50 text-green-700'
    case 'error':
      return 'bg-red-50 text-red-700'
    case 'pending':
      return 'bg-yellow-50 text-yellow-700'
    default:
      return 'bg-gray-50 text-gray-700'
  }
}

// 修改 syncBill 函数
const syncBill = (email: EmailTop) => {
  currentEmail.value = email
  showPasswordModal.value = true
  password.value = '' // 重置密码输入
}

// 修改 confirmSync 函数，添加日志记录
const confirmSync = async () => {
  if (!currentEmail.value || !password.value) return
  
  // 清空之前的处理日志
  logs.value = []
  
  // 立即隐藏密码弹窗
  showPasswordModal.value = false

  // 构建查询参数
  const params = new URLSearchParams({
    uidl: currentEmail.value.uidl,
    password: password.value,
    sender: currentEmail.value.from,
    email: settingsStore.email,
    authCode: settingsStore.authCode,
    notionToken: settingsStore.notionToken,
    databaseId: settingsStore.databaseId
  })

  const eventSource = new EventSource(`/api/sync_bill?${params.toString()}`)

  eventSource.onmessage = (event) => {
    const log = JSON.parse(event.data)
    logs.value.unshift(log)
    
    if (log.status === 'error' || (log.status === 'success' && log.message === '账单处理完成！')) {
      eventSource.close()
    }
  }

  eventSource.onerror = () => {
    eventSource.close()
    logs.value.unshift({
      id: Date.now().toString(),
      message: '连接中断',
      status: 'error',
      timestamp: new Date().toISOString()
    })
  }
}
</script> 