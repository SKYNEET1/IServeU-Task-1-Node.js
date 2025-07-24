const express = require('express')
const app = express();

require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.use(express.json());

const dataController = require('./routes/route');
app.use('/api', dataController);

app.get('/',(req,res)=>{
    res.send('Hi welcome');
})

app.listen(PORT,(req,res)=>{
    console.log(`Your Server started successfully at ${PORT}`)
})

const dbConnect = require('./config/database');
dbConnect();