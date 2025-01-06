import express from 'express'
import { Dream, DiaryEntry } from '../models'

const router = express.Router()

// 获取梦想列表
router.get('/dreams', async (req, res) => {
  const dreams = await Dream.find({ userId: req.user.id })
  res.json(dreams)
})

// 更新梦想进度
router.put('/dreams/:id/progress', async (req, res) => {
  const { seconds } = req.body
  const dream = await Dream.findById(req.params.id)
  dream.accumulatedSeconds += seconds
  await dream.save()
  res.json(dream)
})

// 添加日记条目
router.post('/entries', async (req, res) => {
  const entry = new DiaryEntry({
    ...req.body,
    userId: req.user.id
  })
  await entry.save()
  res.json(entry)
})

export default router 