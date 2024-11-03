import POP3Command from 'node-pop3'
import { downloadAlipayBillAttachment, downloadWechatBillAttachment } from '../utils/download'
import { parseAlipayRecord, parseWeChatBill, Transaction } from '../utils/parser'
import { updateNotionDatabase } from '../utils/upload_notion'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // 改为从 query 中获取参数
  const query = getQuery(event)
  const { uidl, password, sender, email, authCode, notionToken, databaseId } = query as any
  
  const platform = sender.includes('service@mail.alipay.com') ? '支付宝' : '微信'

  // 设置 SSE headers
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  // 创建发送日志的函数
  const sendLog = (message: string, status: 'pending' | 'success' | 'error') => {
    const log = {
      id: Date.now().toString(),
      message,
      status,
      timestamp: new Date().toISOString()
    }
    event.node.res.write(`data: ${JSON.stringify(log)}\n\n`)
  }

  if (!uidl || !password || !email || !authCode || !notionToken || !databaseId) {
    sendLog('缺少必要参数', 'error')
    event.node.res.end()
    return
  }

  const pop3Server = getPop3Server(email)
    
  const client = new POP3Command({
    host: pop3Server, // 邮箱服务器地址
    port: 995, // POP3 端口，通常是 995(SSL)
    tls: true,
    user: email, // 邮箱账号
    password: authCode, // 邮箱密码或授权码
    timeout: 60000  // 添加超时设置，60秒
  })

  sendLog('开始处理账单...', 'pending')

  try {
    let transactions: Transaction[] = []
    
    // 连接邮箱服务器
    sendLog('正在连接邮箱服务器...', 'pending')
    
    if (platform === '支付宝') {
      sendLog('开始下载支付宝账单...', 'pending')
      const csvContent = await downloadAlipayBillAttachment(client, uidl, password)
      sendLog('支付宝账单下载完成，开始解析...', 'pending')
      transactions = parseAlipayRecord(csvContent)
      sendLog(`成功解析 ${transactions.length} 条支付宝交易记录`, 'success')
    } else if (platform === '微信') {
      sendLog('开始下载微信账单...', 'pending')
      const csvContent = await downloadWechatBillAttachment(client, uidl, password)
      sendLog('微信账单下载完成，开始解析...', 'pending')
      transactions = parseWeChatBill(csvContent)
      sendLog(`成功解析 ${transactions.length} 条微信交易记录`, 'success')
    } else {
      sendLog('不支持的邮箱类型', 'error')
      event.node.res.end()
      return
    }

    sendLog('开始同步到 Notion...', 'pending')
    await updateNotionDatabase(
      databaseId, 
      notionToken, 
      platform, 
      transactions,
      sendLog
    )
    sendLog('成功同步到 Notion', 'success')

    // 完成所有操作后发送最终成功消息
    sendLog('账单处理完成！', 'success')
    event.node.res.end()

  } catch (error:any) {
    console.error('处理邮件失败:', error)
    sendLog(`处理失败: ${error.message}`, 'error')
    event.node.res.end()
  }
})
