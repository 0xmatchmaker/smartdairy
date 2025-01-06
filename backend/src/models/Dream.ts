import mongoose from 'mongoose'

const DreamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  dailyGoalMinutes: Number,
  accumulatedSeconds: Number,
  createdAt: { type: Date, default: Date.now }
})

export const Dream = mongoose.model('Dream', DreamSchema) 