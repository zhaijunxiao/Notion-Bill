// 定义服务器映射接口
interface Pop3Servers {
  [key: string]: string;
}

// 定义 POP3 服务器映射
const pop3Servers: Pop3Servers = {
  '163.com': 'pop.163.com',
  '126.com': 'pop.126.com',
  'qq.com': 'pop.qq.com',
  'gmail.com': 'pop.gmail.com',
  'sina.com': 'pop.sina.com',
  'outlook.com': 'pop.outlook.com',
  'hotmail.com': 'outlook.office365.com'
}

/**
 * 根据邮箱地址返回对应的 POP3 服务器地址
 * @param email 邮箱地址
 * @returns POP3 服务器地址
 * @throws 当邮箱格式不正确或不支持该邮箱类型时抛出错误
 */
export const getPop3Server = (email: string): string => {
  if (!email.includes('@')) {
    throw new Error('邮箱格式不正确')
  }
  
  const domain = email.split('@')[1].toLowerCase()
  
  if (!(domain in pop3Servers)) {
    throw new Error(`不支持的邮箱类型: ${domain}`)
  }
  
  return pop3Servers[domain]
}
