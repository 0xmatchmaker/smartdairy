import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import diaryRoutes from './routes/diary'
import userRoutes from './routes/user'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/diary', diaryRoutes)
app.use('/api/user', userRoutes)

mongoose.connect('mongodb://localhost/diary-app') 