const express = require('express')

const config = require('./config/config')

const app = express()
global.appRootPath = __dirname

require('./database/mongoose')

require('./middleware/index')(app)

require('./middleware/routes')(app)

app.listen(config.PORT, () => {
  console.log('server is running on port: ' + config.PORT)
})

module.exports = app
