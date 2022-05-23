const express = require('express')

const api = require('./api')
const { connectToDb } = require('./lib/mongo')

const app = express()
const port = process.env.PORT || 8000

app.use(express.json())
app.use(express.static('public'))

app.use(function (req, res, next) {
    console.log("== Request received")
    console.log("  - METHOD:", req.method)
    console.log("  - URL:", req.url)
    console.log("  - HEADERS:", req.headers)
    console.log("  - BODY:",req.body)
    next()
})

// app.listen(port, function () {
//     console.log("== Server is listening on port:", port)
// })

app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      err: "Server error.  Please try again later."
  })
})

connectToDb(function () {
  app.listen(port, function () {
      console.log("== Server is listening on port:", port)
  })
})