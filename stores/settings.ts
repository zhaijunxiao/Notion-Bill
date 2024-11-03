import { defineStore } from 'pinia'

interface Settings {
  email: string
  authCode: string
  notionToken: string
  databaseId: string
}

export const useSettingsStore = defineStore('settings', {
  state: (): Settings => ({
    email: '',
    authCode: '',
    notionToken: '',
    databaseId: ''
  }),
  persist: true,
  actions: {
    setSettings(settings: Settings) {
      this.email = settings.email
      this.authCode = settings.authCode
      this.notionToken = settings.notionToken
      this.databaseId = settings.databaseId
    }
  }
  
})
