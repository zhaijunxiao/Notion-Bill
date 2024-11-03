import { defineStore } from 'pinia'

export interface EmailTop {
  id: string
  subject: string
  from: string
  date: string
  uidl: string
}



export const useMyEmailtopStore = defineStore({
  id: 'myEmailtopStore',
  state: () => ({
    emails: [] as EmailTop[]
  }),
  actions: {
    setEmails(emails: EmailTop[]) {
      this.emails = emails
    },
  
    loadEmailsFromStorage() {
      const storedEmails = localStorage.getItem('emails')
      if (storedEmails) {
        this.emails = JSON.parse(storedEmails)
      }
    }
  }
})

