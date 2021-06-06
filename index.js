import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
// import cheerio from 'cheerio'
import schedule from 'node-schedule'
import fs from 'fs'

let data = []

const getData = async () => {
  axios
    .get('https://gis.taiwan.net.tw/XMLReleaseALL_public/Walk_f.json')
    .then(response => {
      data = response.data.XML_Head.Infos.Info
    })
    .catch()
}

// 每天 0 點更新資料
schedule.scheduleJob('* * 0 * *', getData)
getData()

// 讓套件讀取 .env 檔案
// 讀取後可以用 process.env.變數 使用
dotenv.config()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.listen('/', process.env.PORT, () => {
  console.log('機器人啟動')
})

const result = data.filter(result => {
  const road = result.Name
  const regex1 = /.+(?:步道)/gi
  // for (const r of road) {
  //   if (r.match(regex1)) {
  //     console.log(r.match(regex1))
  //     return road === event.message.text
  //   }
  // }
  return road.match(regex1) === event.message.text
})
// let reply = ''
// for (const r of result) {
//   reply += 'flex'
// }

const flex = {
  type: 'bubble',
  hero: {
    type: 'image',
    url: 'https://images.unsplash.com/uploads/1412533519888a485b488/bb9f9777?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    size: 'full',
    aspectRatio: '20:13',
    aspectMode: 'cover',
    action: {
      type: 'uri',
      uri: 'http://linecorp.com/'
    }
  },
  body: {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: `${result.Name}`,
        weight: 'bold',
        size: 'xl'
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'lg',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            spacing: 'sm',
            contnts: [
              {
                type: 'text',
                text: '位置:',
                color: '#aaaaaa',
                size: 'sm',
                flex: 1
              },
              {
                type: 'text',
                text: `${result.Add}`,
                wrap: true,
                color: '#666666',
                size: 'sm',
                flex: 5
              }
            ]
          },
          {
            type: 'box',
            layout: 'baseline',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '特色:',
                color: '#aaaaaa',
                size: 'sm',
                flex: 1
              },
              {
                type: 'text',
                text: `${result.Description}`,
                wrap: true,
                color: '#666666',
                size: 'sm',
                flex: 5
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '步行時間:',
                size: 'sm',
                color: '#aaaaaa'
              },
              {
                type: 'text',
                text: `${result.Walkingtime} 小時`,
                flex: 5,
                size: 'sm',
                color: '#666666'
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '推薦附近景點:',
                size: 'sm',
                color: '#aaaaaa',
                margin: 'md'
              },
              {
                type: 'text',
                text: `${result.Landscape}`,
                color: '#666666',
                flex: 5,
                size: 'sm'
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '注意事項:',
                size: 'sm',
                color: '#aaaaaa',
                margin: 'md'
              },
              {
                type: '"ext',
                text: `${result.Remarks}`,
                size: 'sm',
                color: '#666666'
              }
            ],
            flex: 5
          }
        ]
      }
    ]
  },
  footer: {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: '疫情退散後～一起重回大自然懷抱吧！',
        size: 'xs',
        align: 'center',
        color: '#2a9d8f'
      }
    ],
    margin: 'lg',
    spacing: 'sm',
    position: 'relative'
  }
}

bot.on('message', async event => {
  // 縣市搜尋
  if (event.message.type === 'text') {
    try {
      const result = data.filter(result => {
        return result.Region === event.message.text
      })

      let reply = ''
      for (const r of result) {
        reply += `${r.Name} \n地址: ${r.Add} \n步行時間: ${r.Walkingtime}小時\n\n`
      }

      event.reply(reply)
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
  // 鄉鎮搜尋
  if (event.message.type === 'text') {
    try {
      const result = data.filter(result => {
        return result.town === event.message.text
      })

      let reply = ''
      for (const r of result) {
        reply += `${r.Name} \n地址: ${r.Add} \n步行時間: ${r.Walkingtime}小時\n\n`
      }

      event.reply(reply)
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
  // 步道名搜尋
  // if (event.message.type === 'text') {
  //   try {
  //     const result = data.filter(result => {
  //       const road = result.Name
  //       const regex1 = /.+(?:步道)/gi

  //       for (const r of road) {
  //         if (r.match(regex1)) {
  //           console.log(r.match(regex1))
  //           return road === event.message.text
  //         }
  //       }
  //       return result.Name === event.message.text
  //     })

  //     let reply = ''
  //     for (const r of result) {
  //       reply += `${r.Name} \n位置:${r.Add}\n特色:${r.Description} \n\n步行時間: ${r.Walkingtime}小時\n\n推薦附近景點: ${r.Landscape}\n\n注意事項: ${r.Remarks}`
  //     }

  //     event.reply(reply)
  //   } catch (error) {
  //     event.reply('發生錯誤')
  //   }
  // }

  if (event.message.type === 'text') {
    const message = {
      teyp: 'flex',
      altText: '這是 flex',
      contents: {
        teyp: 'carousel',
        contents: [flex]
      }
    }

    fs.writeFileSync('cba.json', JSON.stringify(message, null, 2))
    event.reply(message)
  }
}
)
