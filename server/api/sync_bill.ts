import POP3Command from 'node-pop3'
import { downloadAlipayBillAttachment,downloadWechatBillAttachment } from '../utils/download'
import { parseAlipayRecord,parseWeChatBill,Transaction } from '../utils/parser'
import { updateNotionDatabase } from '../utils/upload_notion'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uidl,password,sender } = body
  
  const platform = sender.includes('service@mail.alipay.com') ? '支付宝' : '微信'

   if (!uidl || !password) {
     throw createError({
       statusCode: 400,
      message: '缺少必要参数 uidl'
    })
  }

  const client = new POP3Command({
    host: 'pop.163.com', // 邮箱服务器地址
    port: 995, // POP3 端口，通常是 995(SSL)
    tls: true,
    user: 'zhjx_bill@163.com', // 邮箱账号
    password: 'JMmPJb7FujdQaq9K', // 邮箱密码或授权码
    timeout: 60000  // 添加超时设置，60秒
  })

  // console.log('sender', sender, 'uidl', uidl, 'password', password)
   try {
     // 获取邮件列表
    let transactions:Transaction[] = []
    if(platform === '支付宝'){
      console.log('开始下载支付宝账单')
      const csvContent = await downloadAlipayBillAttachment(client,uidl,password)
      transactions = parseAlipayRecord(csvContent)
    }else if(platform === '微信'){
      console.log('开始下载微信账单')
      const csvContent = await downloadWechatBillAttachment(client,uidl,password)
      transactions = parseWeChatBill(csvContent)
    }else{
      return { success: false, message: '不支持的邮箱' }
    }

    await updateNotionDatabase('127a16ef96f881b6b976cca0bbef591c',platform,transactions)

    //TODO 上传到Notion
    return { success: true, message: '账单同步成功' }

  } catch (error) {
    console.error('处理邮件失败:', error)
    return { success: false, message: `处理邮件失败` }
  }
})
