# 账单自动解析上传到Notion

这个服务的作用是通过解析账单邮件，然后自动的上传到notion中，减少人为手动输入账单信息。

在notion中，自动根据数据生成图表。

# 原理图解

![image](https://github.com/user-attachments/assets/2ebaf4b4-1d2b-4d84-9a79-9820c8ac1e6f)


# 准备工作

1. 一个邮件接收账单，强烈建议申请一个新的邮箱接收，避免和正常邮箱混用，邮箱需要开启pop3/smtp服务，获取授权码。
2. 一个notion 账号，并复制账单模板，获取数据库ID
3. 创建一个Notion 集成，并获取集成密钥

# 使用教程

1. 创建Notion 集成
   1. 进入`https://www.notion.so/profile/integrations`
   2. 创建一个新集成，类型选择内部即可
   3. 复制 `内部集成密钥`
    
2. 复制Notion 模板
   1. https://www.notion.so/templates/aipay-wechatpay-bill
   2. 链接Notion集成
      
   ![image](https://github.com/user-attachments/assets/9be2aec1-caec-4b7d-9eb5-df01988919f8)

   4. 拷贝模板中的账单记录页的链接
      
   ![image](https://github.com/user-attachments/assets/4fdc80dd-2810-469c-8c7e-67b250d22248)


  得到一个形如https://www.notion.so/a?v=b&pvs=4 格式的链接。
  a 保存一下，这个就是我们要到`数据库ID`
     
4. 获取邮箱授权码
   1. 进入邮箱设置页面，开通Pop3服务，并获取`授权码`

5. 发送账单邮件
   3.1 微信账单
     1. 我的->服务->钱包->账单->常见问题->下载账单->用于个人对账
   3.2 支付宝账单
     1. 我的->账单->开具交易流水->用户个人对账

6. 启动服务并打开网页
   1. 输入以上步骤获取的信息，开始获取邮件
      
   ![image](https://github.com/user-attachments/assets/65982e89-df6b-43c5-ad1a-a1657fa9344b)
   
   2. 同步账单
      
   ![image](https://github.com/user-attachments/assets/62e0d8f3-dbae-4206-8851-d8bf1a63ee6b)


# 服务启动
```
npm install 
npm run build
pm2 start ecosystem.config.cjs
```




