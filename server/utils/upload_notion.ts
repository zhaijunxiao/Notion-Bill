import { Client  } from '@notionhq/client';
import { Transaction } from './parser';

//一个内部函数，获取数据库中已有的数据

async function getNotionDatabase(notion: Client, databaseId: string,platform: string, start:string):Promise<string[]> {

    // 构建查询参数
    const queryParams: any = {
        database_id: databaseId,
        filter: {
        and: []
        },
        // properties: {
        //     "平台交易单号": {} // 只获取平台交易单号属性
        // }
    };

    // 添加日期过滤
    queryParams.filter.and.push({
    property: '日期',
    date: {
        after: start
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


export async function updateNotionDatabase(
  databaseId: string,
  platform: string,
  transactions: Transaction[]
) {
  try {
    // 初始化 Notion 客户端
    const notion = new Client({
      auth: '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',
    });

    // 找出交易记录中最早的日期
    const earliestDate = transactions.reduce((earliest, current) => {
      return current.datetime < earliest ? current.datetime : earliest;
    }, transactions[0].datetime);

    const existingTransactionNumbers = await getNotionDatabase(notion, databaseId, platform, earliestDate.toISOString());

    for(const transaction of transactions){
        if(existingTransactionNumbers.includes(transaction.orderId)){
            console.log(`${transaction.orderId} 已存在`)
        }else{
            // TODO 创建新的交易记录
            console.log(`${transaction.orderId} 添加到notion中`)
        }
    }

  } catch (error) {
    console.error('查询 Notion 数据库失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
