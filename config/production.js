const prod = {
  PORT: process.env.PORT || 3000,
  ADMINS_DB_URL: process.env.ADMINS_DB_URL || 'mongodb://localhost:27017/fantasy_admins',
  LOGIN_HARD_LIMIT: process.env.LOGIN_HARD_LIMIT || 5,
  JWT_VALIDITY: process.env.JWT_VALIDITY || '10d',
  JWT_SECRET: process.env.JWT_SECRET || 'mnopqrstuvwxyz'
}

module.exports = prod
