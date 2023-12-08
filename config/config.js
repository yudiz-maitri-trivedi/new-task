require('dotenv').config()
console.log(process.env.NODE_ENV)

let environment
if (process.env.NODE_ENV === 'test') {
  environment = require('./test.js')
} else if (process.env.NODE_ENV === 'production') {
  environment = require('./production.js')
} else {
  environment = require('./development.js')
}

module.exports = environment
