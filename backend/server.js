const express = require('express')
const app = express()

// server port
const port = 8000

// api module
const api = require('./api')
app.use('/api', api)

// serve static html files (for production use)
const path = require('path')
app.use(express.static(path.join(__dirname, '../dist')))

// start server
app.listen(port, () => {
  console.log(`Server runnung on port ${port}!`)
});