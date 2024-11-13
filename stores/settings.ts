import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', 
  () => {
    const email = useStorage('settings-email', '')
    const authCode = useStorage('settings-authCode', '')
    const notionToken = useStorage('settings-notionToken', '')
    const databaseId = useStorage('settings-databaseId', '')

    const setSettings = (settings: {
      email: string
      authCode: string
      notionToken: string
      databaseId: string
    }) => {
      email.value = settings.email
      authCode.value = settings.authCode
      notionToken.value = settings.notionToken
      databaseId.value = settings.databaseId
    }

    return {
      email,
      authCode,
      notionToken,
      databaseId,
      setSettings
    }
  },
  {
    persist: true,
  }
)
