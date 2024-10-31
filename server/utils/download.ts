// server/utils/bills/downloader.ts
import  POP3Command, { Integer }  from 'node-pop3'
import { simpleParser } from 'mailparser'
import AdmZip from 'adm-zip'
import iconv from 'iconv-lite'
import axios from 'axios'
import { request } from 'undici'


export const downloadWechatBillAttachment = async (client: POP3Command, emailId: Integer, password: string): Promise<string> => {
    try {
        const rawEmail = await client.RETR(emailId)
        const parsed = await simpleParser(rawEmail)
        const contentHtml = parsed.html
        
        if (typeof contentHtml !== 'string') {
            throw new Error('HTML 内容无效')
        }
        const urlMatch = contentHtml.match(/https:\/\/download\.bill\.weixin\.qq\.com\/[^"]*/i)
        if (!urlMatch || urlMatch.length === 0) {
            throw new Error('未找到下载链接')
        }
        const downloadUrl = urlMatch[0]
        
        const response = await request(downloadUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })
        
        if(response.statusCode !== 200) {
            throw new Error(`下载失败，状态码: ${response.statusCode}`)
        }
        
        // 将 response.body 转换为 Buffer
        const bodyBuffer = Buffer.from(await response.body.arrayBuffer())
        
        const unzip = new AdmZip(bodyBuffer)
        
        const zipEntries = unzip.getEntries()
        // 查找并处理CSV文件
        for (const entry of zipEntries) {
            console.log('entry nam', entry)
            if (entry.entryName.toLowerCase().endsWith('.csv')) {
                // 确保密码是字符串并且不为空
                if (typeof password !== 'string' || password.trim() === '') {
                    throw new Error('无效的解压密码')
                }         
                // 直接从内存中读取CSV内容
                const csvBuffer = unzip.readFile(entry.entryName, password)
                if (csvBuffer) {
                    const csvContent = iconv.decode(csvBuffer, 'utf8')
                    return csvContent
                }      
            }
        }
        throw new Error('解压失败')
      
    } catch (error) {
        console.error('下载微信账单时发生错误:', error)
        if (axios.isAxiosError(error)) {
            console.error('请求详情:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers
            })
        }
        // 添加更详细的错误信息
        if (error instanceof Error) {
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            })
        }
        throw error
    }
}

export const downloadAlipayBillAttachment = async (client: POP3Command, emailId: Integer, password: string): Promise<string> => {
  const rawEmail = await client.RETR(emailId)
  const parsed = await simpleParser(rawEmail)
  
  if (parsed.attachments && parsed.attachments.length > 0) {
    console.log('附件数量：', parsed.attachments.length)
    
    // 直接从内存中读取ZIP内容
    const zipBuffer = parsed.attachments[0].content
    const unzip = new AdmZip(zipBuffer)
    
    // 获取所有ZIP文件条目
    const zipEntries = unzip.getEntries()
    
    // 查找并处理CSV文件
    for (const entry of zipEntries) {
      if (entry.entryName.toLowerCase().endsWith('.csv')) {
        // 确保密码是字符串并且不为空
        if (typeof password !== 'string' || password.trim() === '') {
          throw new Error('无效的解压密码')
        }
        
        // 直接从内存中读取CSV内容
        const csvBuffer = unzip.readFile(entry.entryName, password)
        if (csvBuffer) {
          const csvContent = iconv.decode(csvBuffer, 'gbk')
          return csvContent
        }
        throw new Error('解压失败')
      }
    }
  }
  throw new Error('未找到支付宝账单附件')
}
  