const express = require('express')
const path = require('path')

const app = express()
const config = require('./config')
const port = 8000

app.use(express.static(path.join(__dirname, '../dist')))  // serve static html files (for production use)
app.use('/data', express.static(config.csvLocation))  // serve csv files

// start server
app.listen(port, () => {
  console.log(`Server runnung on port ${port}!`)
});