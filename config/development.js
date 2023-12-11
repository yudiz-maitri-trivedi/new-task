const dev = {
  PORT: process.env.PORT || 3000,
  ADMINS_DB_URL: process.env.ADMINS_DB_URL || 'mongodb://localhost:27017/wp_web_admins',
  LOGIN_HARD_LIMIT: process.env.LOGIN_HARD_LIMIT || 5,
  JWT_VALIDITY: process.env.JWT_VALIDITY || '10d',
  JWT_SECRET: process.env.JWT_SECRET || 'mnopqrstuvwxyz',
  ADMIN_LOGIN_AUTHENTICATION: 'password',
  // ADMIN_LOGIN_AUTHENTICATION: process.env.ADMIN_LOGIN_AUTHENTICATION || 'password',
  OTP_PROVIDER: process.env.OTP_PROVIDER || 'TEST',
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  PUBLIC_KEY: process.env.PUBLIC_KEY,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  IV_VALUE: process.env.IV_VALUE || 'abcdef9876543210abcdef9876543210',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'abcdefghijklmnopqrstuvwxyz',
  REFRESH_TOKEN_VALIDITY: process.env.REFRESH_TOKEN_VALIDITY || '10d'
}

module.exports = dev
