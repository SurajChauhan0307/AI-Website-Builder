import express from 'express'
import 'dotenv/config'
import connectDB from './database/db.js'
import authRoute from "./routes/authRoute.js"
import websiteRoute from "./routes/websiteRoute.js"
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
const PORT = process.env.PORT || 3000

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use('/api/auth', authRoute)
app.use('/api/website', websiteRoute)

// http:Localhost:8000/api/auth/google

app.listen(PORT, () =>{
    connectDB()
    console.log(`Server is listening at port:${PORT}`);
})