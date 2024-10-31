import POP3Command from 'node-pop3'
import { simpleParser } from 'mailparser'

export default defineEventHandler(async (event) => {
  try {
    const client = new POP3Command({
      host: 'pop.163.com', // 邮箱服务器地址
      port: 995, // POP3 端口，通常是 995(SSL)
      tls: true,
      user: 'zhjx_bill@163.com', // 邮箱账号
      password: 'JMmPJb7FujdQaq9K', // 邮箱密码或授权码
      timeout: 60000  // 添加超时设置，60秒
    })

    const status = await client.STAT()
    const totalCount = parseInt(status.split(' ')[0])
    
    // 计算起始索引，获取最近100封邮件
    const startIndex = Math.max(totalCount - 100, 1)
    const targetEmails = []
    
    // 获取UIDL列表
    const uidlList = await client.UIDL()
    
    for (let i = totalCount; i >= startIndex; i--) {
      // 只获取头部信息
      const headerInfo = await client.TOP(i, 0)
      const parsed = await simpleParser(headerInfo)
      
      const fromAddress = parsed.from?.text || ''
      if (fromAddress.includes('service@mail.alipay.com') || 
          fromAddress.includes('wechatpay@tencent.com')) {
        targetEmails.push({
          messageNumber: i,
          uidl: uidlList[i - 1][0],  // 修复类型错误
          from: fromAddress,
          subject: parsed.subject,
          date: parsed.date
        })
      }
    }

    await client.QUIT()
    console.log(targetEmails)
    return { code: 200, data: targetEmails }
    
  } catch (error) {
    console.error('获取邮件错误:', error)
    return { code: 500, message: '获取邮件失败' }
  }
}) 