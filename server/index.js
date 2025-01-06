const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs').promises
const path = require('path')

const app = express()
const dataDir = path.join(__dirname, 'data')

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    console.error('Failed to create data directory:', error)
  }
}

// 获取数据
app.get('/diary-data', async (req, res) => {
  try {
    const since = req.query.since
    const files = await fs.readdir(dataDir)
    
    const data = []
    for (const file of files) {
      if (!since || file > since) {
        const content = await fs.readFile(path.join(dataDir, file), 'utf-8')
        data.push(JSON.parse(content))
      }
    }
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

// 保存数据
app.post('/diary-data', async (req, res) => {
  try {
    const { data, checksum, timestamp } = req.body
    const filename = `${timestamp}.json`
    
    await fs.writeFile(
      path.join(dataDir, filename),
      JSON.stringify({ data, checksum, timestamp }),
      'utf-8'
    )
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' })
  }
})

// 获取所有数据（调试用）
app.get('/debug/all-data', async (req, res) => {
  try {
    const files = await fs.readdir(dataDir)
    const allData = []
    
    for (const file of files) {
      const content = await fs.readFile(path.join(dataDir, file), 'utf-8')
      allData.push({
        filename: file,
        ...JSON.parse(content)
      })
    }
    
    res.json(allData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch debug data' })
  }
})

// 清除所有数据（调试用）
app.post('/debug/clear-data', async (req, res) => {
  try {
    const files = await fs.readdir(dataDir)
    await Promise.all(
      files.map(file => fs.unlink(path.join(dataDir, file)))
    )
    res.json({ success: true, message: 'All data cleared' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear data' })
  }
})

// 获取数据统计（调试用）
app.get('/debug/stats', async (req, res) => {
  try {
    const files = await fs.readdir(dataDir)
    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      oldestFile: null,
      newestFile: null
    }
    
    for (const file of files) {
      const filePath = path.join(dataDir, file)
      const fileStats = await fs.stat(filePath)
      stats.totalSize += fileStats.size
      
      if (!stats.oldestFile || file < stats.oldestFile) {
        stats.oldestFile = file
      }
      if (!stats.newestFile || file > stats.newestFile) {
        stats.newestFile = file
      }
    }
    
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

// 启动服务器
ensureDataDir().then(() => {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}) 