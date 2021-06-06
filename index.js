import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
// import cheerio from 'cheerio'
import schedule from 'node-schedule'
// import fs from 'fs'

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
        reply += `
        <h1>${r.Name}</h1> 
        \n<span style="color: #aaa;">位置:</span>&emsp;<span style="color: #666;">${r.Add}</span>
        \n特色:&emsp;${r.Description} 
        \n\n步行時間:&emsp;${r.Walkingtime}小時
        \n\n推薦附近景點:&emsp;${r.Landscape}
        \n\n注意事項:&emsp;${r.Remarks}
        `
      }

      event.reply(reply)
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
}
)
