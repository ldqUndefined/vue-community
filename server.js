const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const login = require('./routes/api/login')
const article = require('./routes/api/article')
const user = require('./routes/api/user')
const jwtMiddleware = require('./config/jwt')

mongoose.connect('mongodb://localhost:27017/sysuer_test', {useNewUrlParser: true,useCreateIndex: true,})
        .then(() => {console.log('数据库连接成功')})
        .catch((err) => {console.log(err)})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/uploads',express.static('uploads'))
app.use('/api/login',login)
app.use(jwtMiddleware)
app.use('/api/article',article)
app.use('/api/user',user)

app.listen(5000,() => {
    console.log('服务端已开启')
})