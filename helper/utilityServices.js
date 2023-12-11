const jwt = require('jsonwebtoken')
const { status, messages, jsonStatus } = require('../helper/api.responses')
const config = require('../config/config')
const { randomInt } = require('crypto')
const { PUBLIC_KEY, ENCRYPTION_KEY, IV_VALUE } = require('../config/config')
const RSA = require('hybrid-crypto-js').RSA
const Crypt = require('hybrid-crypto-js').Crypt
const crypt = new Crypt()
// const { imageFormat } = require('../enum')
const CryptoJS = require('crypto-js')
const encryptedKey = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY)
const iv = CryptoJS.enc.Hex.parse(IV_VALUE)
const path = require('path')
// const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
// const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
// const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/
// const enums = require('../enum')

const catchError = (name, error, req, res) => {
  return res.status(status.internalServerError).jsonp({
    status: jsonStatus.internalServerError,
    message: messages[req.userLanguage].error
  })
}

const generateToken = (payload) => jwt.sign(
  payload,
  config.JWT_SECRET_KEY,
  { expiresIn: config.JWT_VALIDITY }
)

const removeNull = (obj) => {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
      delete obj[propName]
    }
  }
}

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    // eslint-disable-next-line no-prototype-builtins
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key]
    }
    return obj
  }, {})
}

const checkAlphaNumeric = (input) => {
  const letters = /^[0-9a-zA-Z]+$/
  return !!(input.match(letters))
}

const defaultSearch = (val) => {
  let search
  if (val) {
    search = val.replace(/\\/g, '\\\\')
      .replace(/\$/g, '\\$')
      .replace(/\*/g, '\\*')
      .replace(/\+/g, '\\+')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\)/g, '\\)')
      .replace(/\(/g, '\\(')
      .replace(/'/g, '\\\'')
      .replace(/"/g, '\\"')
    return search
  } else {
    return ''
  }
}

const getPaginationValues = (obj) => {
  const { nStart = 0, nLimit = 10, sort = 'dCreatedAt', order, search } = obj

  const orderBy = order && order === 'asc' ? 1 : -1

  const oSorting = { [sort]: orderBy }

  return { nStart, nLimit, oSorting, search }
}

function checkValidImageType (sFileName, sContentType) {
  const aImageFormat = [{ extension: '.jpeg', type: 'image/jpeg' }, { extension: '.jpg', type: 'image/jpg' }, { extension: '.png', type: 'image/png' }, { extension: '.heic', type: 'image/heic' }]
  const sExtension = path.extname(sFileName)
  const valid = aImageFormat.find(format => format.extension === sExtension && format.type === sContentType)
  return valid
}

const encryption = function (field) {
  const encrypted = crypt.encrypt(PUBLIC_KEY, field)
  return encrypted.toString()
}
const getIp = function (req) {
  try {
    let ip = req.header('x-forwarded-for') ? req.header('x-forwarded-for').split(',') : []
    ip = ip[0] || req.socket.remoteAddress
    return ip
  } catch (error) {
    console.log(error)
  }
}

const responseMessage = (req, res, Status, Message, Replace, ...args) => {
  let mes
  if (!Replace) mes = messages[req.userLanguage][Message]
  else mes = messages[req.userLanguage][Message].replace('##', messages[req.userLanguage][Replace])
  if (!args?.length) return res.status(status[Status]).json({ status: status[Status], message: mes })
  return res.status(status[Status]).json({ status: status[Status], message: mes, data: args[0] })
}

const generateOTP = (nLength) => {
  const digits = '0123456789'
  let OTP = ''
  for (let i = 0; i < nLength; i++) {
    OTP += digits[generateNumber(0, 10)]
  }
  if (Number(OTP).toString().length !== nLength) {
    return generateOTP(nLength)
  }
  return OTP
}

function generateNumber (min, max) {
  return randomInt(min, max)
}

function validateMobile (mobile) {
  return !mobile.match(/^\+?[1-9][0-9]{8,12}$/) // !mobile.match(/^\d{10}$/)
}

function encryptKey (value) {
  if (value) {
    const message = CryptoJS.enc.Utf8.parse(value)
    const encrypted = CryptoJS.AES.encrypt(message, encryptedKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    const cipherText = encrypted.toString()
    return cipherText
  }
}

function encryptKeyPromise (value) {
  return new Promise((resolve, reject) => {
    try {
      if (value) {
        const message = CryptoJS.enc.Utf8.parse(value)
        const encrypted = CryptoJS.AES.encrypt(message, encryptedKey, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        })
        const cipherText = encrypted.toString()
        resolve(cipherText)
      }
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function decryptValue (key) {
  if (key) {
    const decrypted = CryptoJS.AES.decrypt(key, encryptedKey, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
    const decryptedMessage = decrypted?.toString(CryptoJS.enc.Utf8)
    if (decryptedMessage.length) { return decryptedMessage }

    return key
  }
}

function decryptValuePromise (key) {
  return new Promise((resolve, reject) => {
    try {
      if (key) {
        const decrypted = CryptoJS.AES.decrypt(key, encryptedKey, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        const decryptedMessage = decrypted?.toString(CryptoJS.enc.Utf8)
        if (decryptedMessage.length) { resolve(decryptedMessage) }
        resolve(key)
      }
    } catch (error) {
      reject(error)
    }
  })
}

async function decryptIfExist (object, fields) {
  await Promise.all(
    fields.map(async field => {
      if (object?.[field]) object[field] = await decryptValuePromise(object[field])
    })
  )
}

function maskIfExist (object, fields) {
  fields.forEach(field => {
    if (object?.[field]) object[field] = ''
  })
}
function generateKeyPair() {
  const rsa = new RSA()
  rsa.generateKeyPairAsync().then(keyPair => {
    const publicKey = keyPair.publicKey
    const privateKey = keyPair.privateKey
    console.log(11, 'privateKey', privateKey)
    console.log(22, 'publicKey', publicKey)
  })
}
module.exports = { catchError, generateToken, removeNull, getPaginationValues, encryption, getIp, defaultSearch, encryptKey, encryptKeyPromise, decryptIfExist, maskIfExist, decryptValue, decryptValuePromise, responseMessage, pick, checkValidImageType, validateMobile, checkAlphaNumeric, generateOTP }
