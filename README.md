# 账单自动解析上传到Notion

这个服务的作用是通过解析账单邮件，然后自动的上传到notion中，减少人为手动输入账单信息。

在notion中，自动根据数据生成图表。

# 原理图解

![image](https://github.com/user-attachments/assets/2ebaf4b4-1d2b-4d84-9a79-9820c8ac1e6f)




# 使用教程

1. 复制Notion 模板
2. 创建Notion 集成
3. 发送账单邮件
4. 解析邮件并发送到notion


# 服务启动

```
npm install 
npm run build
pm2 start ecosystem.config.cjs
```




