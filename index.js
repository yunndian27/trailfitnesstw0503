import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import schedule from 'node-schedule'

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

bot.on('message', async event => {
  // 縣市搜尋 - 基本款
  if (event.message.type === 'text') {
    try {
      const result = data.filter(result => {
        return result.Region === event.message.text
      })

      let reply = ''
      for (const r of result) {
        reply += ` ▶${r.Name}
        \n地址: \n  ${r.Add}
        \n步行時間: ${r.Walkingtime} 小時\n\n
        ┄┄┄┄┄┄┄┄┄┄(✿◠‿◠)`
      }

      event.reply(reply)
    } catch (error) {
      event.reply('發生錯誤～等待修復')
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
        reply += ` ▶${r.Name} 
        \n  地址: \n  ${r.Add} 
        \n  步行時間: ${r.Walkingtime} 小時\n\n
        ┄┄┄┄┄┄┄┄┄('・ω・')`
      }

      event.reply(reply)
    } catch (error) {
      event.reply('發生錯誤～等待修復')
    }
  }
  // 步道名搜尋
  if (event.message.type === 'text') {
    try {
      const result = data.filter(result => {
        const road = result.Name
        const regex1 = /.+(?:步道)/gi

        for (const r of road) {
          if (r.match(regex1)) {
            console.log(r.match(regex1))
            return road === event.message.text
          }
        }
        return result.Name === event.message.text
      })

      let reply = ''
      for (const r of result) {
        reply += `▶${r.Name} 
        \n  位置: \n  ${r.Add}
        \n  步行時間: ${r.Walkingtime} 小時
        \n\n  特色: ${r.Description}
        \n\n  推薦附近景點: ❊【${r.Landscape}】❊
        \n\n  ※ 注意事項: ${r.Remarks}
        \n  •̀.̫•́✧ 疫情退散後～一起重回大自然懷抱吧！`
      }

      event.reply(reply)
    } catch (error) {
      event.reply('發生錯誤～等待修復')
    }
  }
}
)
