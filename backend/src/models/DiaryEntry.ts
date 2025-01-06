import mongoose from 'mongoose'

const DiaryEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  content: String,
  dreamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dream' },
  timestamp: { type: Date, default: Date.now }
})

export const DiaryEntry = mongoose.model('DiaryEntry', DiaryEntrySchema) 