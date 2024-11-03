import { Client  } from '@notionhq/client';
import { Transaction } from './parser';
import { UpdateDatabaseParameters ,QueryDatabaseParameters} from '@notionhq/client/build/src/api-endpoints';

//一个内部函数，获取数据库中已有的数据

async function getNotionDatabase(notion: Client, databaseId: string,platform: string, start:string):Promise<string[]> {

    // 构建查询参数
    const queryParams: any = {
        database_id: databaseId,
        filter: {
        and: []
        },
        properties: {
            "平台交易单号": {} // 只获取平台交易单号属性
        }
    };

    // 添加日期过滤
    queryParams.filter.and.push({
    property: '日期',
    date: {
        on_or_after: start
    }
    });

    // 添加平台过滤
    queryParams.filter.and.push({
    property: '交易平台',
    select: {
        equals: platform
    }
    });
    
    // 执行查询
    const response = await notion.databases.query(queryParams);
    let has_more:boolean = response.has_more
    let next_cursor = response.next_cursor
    while(has_more){
        queryParams.start_cursor = next_cursor
        const next_response = await notion.databases.query(queryParams)
        response.results = response.results.concat(next_response.results)
        has_more = next_response.has_more
        next_cursor = next_response.next_cursor
    }
   
    let transactionNumbers:string[] = []
    response.results.forEach(item => {
        if('properties' in item){
            if('rich_text' in item.properties['平台交易单号']){
                if(Array.isArray(item.properties['平台交易单号'].rich_text) && 
                   item.properties['平台交易单号'].rich_text.length > 0){
                    const transactionNumber = item.properties['平台交易单号'].rich_text[0].plain_text
                    if(transactionNumber){
                        transactionNumbers.push(transactionNumber)
                    }
                }
            }

        }
    })
    return transactionNumbers
}

async function uploadTransactionToNotion(notion: Client, databaseId: string, transaction: Transaction, platform: string) {
    const createParams:any = {
        parent: {
            database_id: databaseId,
        },
        properties: {
            "日期": {
                date: {
                    start: transaction.datetime.toISOString(),
                }
            },
            "星期": {
                select: {
                    name: getWeekDay(transaction.datetime),
                }
            },
            "账单信息": {
                title: [
                    {
                        type: "text",
                        text: { content: transaction.description }
                    }
                ]
            },
            "金额": {
                number: transaction.amount
            },
            "交易平台": {
                select: {
                    name: platform
                }
            },
            "交易类型": {
                select: {
                    name: transaction.type
                }
            },
            "交易方式": {
                rich_text: [
                    {
                        type: "text",
                        text: { content: transaction.paymentMethod }
                    }
                ]
            },
            "平台交易单号": {
                rich_text: [
                    {
                        type: "text",
                        text: { content: transaction.orderId }
                    }
                ]
            }
        }
    };

    try {
        const response = await notion.pages.create(createParams);
        return response;
    } catch (error) {
        console.error(`上传交易记录失败 (${transaction.orderId}):`, error);
        throw error;
    }
}

// 辅助函数：获取星期几
function getWeekDay(date: Date): string {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekDays[date.getDay()];
}

export async function updateNotionDatabase(
  databaseId: string,
  notionToken: string,
  platform: string,
  transactions: Transaction[],
  sendLog: (message: string, status: 'pending' | 'success' | 'error') => void
) {
    const notion = new Client({ auth: notionToken })
    //获取一个最早的时间
    const earliestDate = transactions.reduce((min, transaction) => transaction.datetime < min ? transaction.datetime : min, transactions[0].datetime)
    const existingTransactionNumbers = await getNotionDatabase(notion, databaseId, platform, earliestDate.toISOString())
    const newTransactions = transactions.filter(transaction => !existingTransactionNumbers.includes(transaction.orderId))
    sendLog(`已过滤掉 ${transactions.length - newTransactions.length} 条已存在的记录`, 'pending')
    
    for (let i = 0; i < newTransactions.length; i++) {
        try{
            await uploadTransactionToNotion(notion, databaseId, newTransactions[i], platform)
            // 每上传一条记录发送一次日志
            sendLog(`已同步 ${i + 1}/${newTransactions.length} 条${platform}记录, 信息：${newTransactions[i].description}`, 'pending')
        
            // 可选：每次上传后添加一个小延迟，避免触发 Notion API 限制
            //await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error: any) {
            sendLog(`同步第 ${i + 1} 条记录失败: ${error.message}`, 'error')
            throw error
        }
    }
}
