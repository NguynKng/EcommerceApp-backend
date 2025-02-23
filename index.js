const express = require('express')
const app = express()
const { PORT } = require("./config/envVars")
const connectDB = require("./config/dbConnect")
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const cors = require('cors')

const corsOptions = {
    origin: 'http://localhost:5173', // Change this to your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow credentials
};


app.use(morgan("dev"))
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1', require("./routes/index"))

app.use('/', (req, res)=>{
    res.send('API is running')
})

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
    connectDB()
})