const mongoose = require('mongoose')
const { messages } = require('../helper/api.responses')
const config = require('../config/config')

const AdminsDBConnect = connection(config.ADMINS_DB_URL, 'Admins')

function connection (DB_URL, DB) {
  try {
    // const dbConfig = { useNewUrlParser: true, useUnifiedTopology: true, readPreference: 'secondaryPreferred' }
    const conn = mongoose.createConnection(DB_URL)
    conn.on('connected', () => console.log(`Connected to ${DB} database...`))
  } catch (error) {
    console.log(messages.en.mongoDBError, error)
  }
}

module.exports = {
  AdminsDBConnect
}
