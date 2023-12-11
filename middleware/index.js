const express = require('express')
// const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
// const cachegoose = require('recachegoose')
const helmet = require('helmet')
// const hpp = require('hpp')
// const fileUpload = require('express-fileupload')

// const config = require('../config/config')

module.exports = (app) => {
//   if (process.env.NODE_ENV === 'production') {
//     Sentry.init({
//       dsn: config.SENTRY_DSN,
//       tracesSampleRate: 1.0
//     })
//   }
  // cachegoose(mongoose, {
  //   engine: 'redis',
  //   host: config.REDIS_HOST,
  //   port: config.REDIS_PORT
  // })

  // app.use(morgan('dev'))

  app.use(cors())
  app.use(helmet())
  app.disable('x-powered-by')
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  // app.use(hpp())

  /* global appRootPath */
  app.use(express.static(path.join(appRootPath, 'public')))
  // set language in request object
  app.use((req, res, next) => {
    switch (req.header('Language')) {
      case 'hi':
        req.userLanguage = 'Hindi'
        break

      case 'en-us':
        req.userLanguage = 'English'
        break

      default :
        req.userLanguage = 'English'
    }
    next()
  })
}
