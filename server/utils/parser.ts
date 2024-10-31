
export interface Transaction {
  datetime: Date
  category: string
  counterparty: string
  description: string
  type: '收入' | '支出' | '不计收支'
  amount: number
  paymentMethod: string
  status: string
  orderId: string
  merchantOrderId: string
  remark?: string
}

export const parseAlipayRecord = (content: string): Transaction[] => {
  const transactions: Transaction[] = []
  
  // 将内容按行分割
  const lines = content.split('\n')
  
  // 找到数据开始的位置
  const headerIndex = lines.findIndex(line => line.startsWith('交易时间,交易分类'))
  if (headerIndex === -1) return transactions
  
  // 解析每一行数据
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      // 使用CSV解析，处理字段中可能包含逗号的情况
      const fields = line.split(',').map(field => field.trim())
      if (fields.length < 11) continue
      
      const [
        datetimeStr,
        category,
        counterparty,
        _account,  // 对方账号，暂不使用
        description,
        type,
        amountStr,
        paymentMethod,
        status,
        orderId,
        merchantOrderId,
        remark = ''
      ] = fields

      // 解析日期和金额
      const datetime = new Date(datetimeStr)
      const amount = parseFloat(amountStr) || 0

      transactions.push({
        datetime,
        category,
        counterparty,
        description,
        type: type as Transaction['type'],
        amount,
        paymentMethod,
        status,
        orderId,
        merchantOrderId,
        remark: remark || undefined
      })
    } catch (error) {
      console.error('解析行数据失败:', error)
      continue
    }
  }
  
  return transactions
}

export function parseWeChatBill(csvContent: string): Transaction[] {
  // 按行分割
  const lines = csvContent.split('\n')
  
  // 找到交易记录开始的位置
  const startIndex = lines.findIndex(line => 
    line.includes('交易时间,交易类型,交易对方,商品,收/支,金额(元),支付方式,当前状态,交易单号,商户单号,备注')
  )
  
  if (startIndex === -1) {
    throw new Error('找不到交易记录起始位置')
  }

  // 解析交易记录
  return lines.slice(startIndex + 1)
    .filter(line => line.trim()) // 过滤空行
    .map(line => {
      const [
        datetime, category, counterparty, description,
        type, amount, paymentMethod, status,
        orderId, merchantOrderId, remark
      ] = line.split(',').map(field => field.trim())

      // 处理金额字段,移除¥符号并转换为数字
      const cleanAmount = amount.replace('¥', '').replace(',', '')
      
      return {
        datetime: new Date(datetime),
        category,
        counterparty: counterparty.replace('/"', ''), // 清理引号
        description: description.replace('/"', ''),
        type: type as '收入' | '支出' | '不计收支',
        amount: parseFloat(cleanAmount),
        paymentMethod: paymentMethod.replace('/"', ''),
        status,
        orderId: orderId.trim(),
        merchantOrderId: merchantOrderId.trim(),
        remark: remark?.replace('/"', '') || undefined
      }
    })
    .filter(transaction => transaction.datetime && !isNaN(transaction.amount)) // 过滤无效数据
}



