require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
const cors = require('cors')
require('./config/passport')(passport)
const authRoute = require('./routes').auth
const courseRoute = require('./routes').course
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

// mongoose.connect('mongodb://localhost:27017/mernDB').then(() => {
// mongoose.connect(process.env.MONGODB_CONNECTION).then(() => {
mongoose.connect(process.env.MONGODB_CONNECTION).then(() => {
  console.log('connect DB success')
}).catch((e) => {
  console.log(e)
})

//router
app.use('/api/user', authRoute)
app.use('/api/course', passport.authenticate('jwt', { session: false }) ,courseRoute)
// app.use('/api/course' ,courseRoute)
app.listen(8080, () => {
  console.log('server is listing on port 8080')
})