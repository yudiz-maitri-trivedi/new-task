const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const AdminsModel = require('../../admin/model')
const OTPVerificationsModel = require('../otpVerification.model.js')
// const adminServices = require('../adminLogs/services')
const AdminAuthLogsModel = require('../authlogs.model')
// const RolesModel = require('../roles/model')
const { messages, status, jsonStatus } = require('../../../helper/api.responses')
const { removeNull, catchError, pick, checkAlphanumeric, getIp, validateMobile, generateOTP, encryptKeyPromise, decryptValuePromise, decryptIfExist } = require('../../../helper/utilityServices.js')
const config = require('../../../config/config')
const { checkRateLimit, checkRateLimitOTP, queuePush } = require('../../../helper/redis')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
// const axios = require('axios')
// const { testCasesDefault } = require('../../../config/testCases.js')
// const { checkLocationValidity, checkCodeValidity } = require('./common.js')

class AdminAuth {
  /**
   * Admin login using OTP or Password.
   * @param {*} req  'sLogin', 'sDeviceToken', 'sPassword', 'sPushToken'.
   * @param {*} res  OTP send message or Login successful message with jwt token
   * @returns OTP send message or Login admin with jwt token
   */
  async loginV3 (req, res) {
    try {
      if (config.ADMIN_LOGIN_AUTHENTICATION === 'otp') {
        req.body = pick(req.body, ['sLogin', 'sDeviceToken'])
        removeNull(req.body)
        let { sLogin, sDeviceToken } = req.body
        const sType = validateMobile(sLogin) ? 'e' : 'm'
        sLogin = sLogin.toLowerCase().trim()
        sLogin = await encryptKeyPromise(sLogin)
        const admin = await AdminsModel.findOne({ $or: [{ sEmail: sLogin }, { sMobNum: sLogin }], eStatus: 'a' }).populate({ path: 'aRole' })
        // console.log('here', admin)
        if (!admin) {
          return res.status(status.notFound).jsonp({
            status: jsonStatus.notFound,
            message: messages[req.userLanguage].auth_failed
          })
        }
        if (process.env.NODE_ENV === 'production') {
          const d = new Date()
          d.setSeconds(d.getSeconds() - 30)
          const exist = await OTPVerificationsModel.findOne({ sLogin, sType, sAuth: 'l', dCreatedAt: { $gt: d } }, null, { readPreference: 'primary' }).sort({ dCreatedAt: -1 })
          if (exist) return res.status(status.badRequest).jsonp({ status: jsonStatus.badRequest, message: messages[req.userLanguage].err_resend_otp.replace('##', messages[req.userLanguage].nThirty) })
        }
        let sCode = 8697
        if (['production', 'staging'].includes(process.env.NODE_ENV) && config.OTP_PROVIDER !== 'TEST') sCode = generateOTP(4)
        if (sType === 'E') {
          const decEmail = await decryptValuePromise(admin.sEmail)
          await Promise.all([
            OTPVerificationsModel.create({ sLogin, sCode, sType, sAuth: 'l', sDeviceToken, iAdminId: admin._id }),
            queuePush('SendMail', {
              sSlug: 'send-otp-email',
              replaceData: {
                email: admin.sUsername,
                otp: sCode,
                from: config.SMTP_FROM
              },
              to: decEmail
            })
          ])
        } else if (sType === 'm' && ['production', 'staging'].includes(process.env.NODE_ENV) && config.OTP_PROVIDER !== 'TEST') {
          const decLogin = await decryptValuePromise(sLogin)
          await Promise.all([
            OTPVerificationsModel.create({ sLogin, sCode, sType, sAuth: 'l', sDeviceToken, iAdminId: admin._id }),
            queuePush('sendSms', {
              sProvider: config.OTP_PROVIDER,
              oUser: {
                sPhone: decLogin,
                sOTP: sCode
              }
            })
          ])
        }

        return res.status(status.OK).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].OTP_sent_succ })
      } else {
        req.body = pick(req.body, ['sLogin', 'sPassword', 'sPushToken', 'sDeviceToken'])
        removeNull(req.body)
        let { sLogin, sPushToken, sPassword, sDeviceToken } = req.body
        // check rate limit for password sending from same ip at multiple time. we'll make sure not too many request from same ip will occurs.
        const rateLimit = await checkRateLimit(5, `rlpassword:${sLogin}`, getIp(req))
        if (rateLimit === 'LIMIT_REACHED') return res.status(status.tooManyRequest).jsonp({ status: jsonStatus.tooManyRequest, message: messages[req.userLanguage].limit_reached.replace('##', messages[req.userLanguage].cpassword) })

        sLogin = sLogin.toLowerCase().trim()
        // sLogin = await encryptKeyPromise(sLogin)
        let admin = await AdminsModel.findOne({ $or: [{ sEmail: sLogin }, { sMobNum: sLogin }], eStatus: 'a' }).populate({ path: 'aRole' })
        if (!admin) {
          return res.status(status.notFound).jsonp({
            status: jsonStatus.notFound,
            message: messages[req.userLanguage].auth_failed
          })
        }
        // if (!bcrypt.compareSync(sPassword, admin.sPassword)) {
        //   return res.status(status.badRequest).jsonp({
        //     status: jsonStatus.badRequest,
        //     message: messages[req.userLanguage].auth_failed
        //   })
        // }
        if (rateLimit === 'LIMIT_REACHED') {
          return res.status(status.tooManyRequest).jsonp({ status: jsonStatus.tooManyRequest, message: messages[req.userLanguage].limit_reached.replace('##', messages[req.userLanguage].cpassword) })
        }
        const sRefreshToken = jwt.sign({ _id: (admin._id), eType: admin.eType, sLatitude: admin?.sLatitude || '', sLongitude: admin?.sLongitude || '' }, config.REFRESH_TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_VALIDITY })

        const newToken = {
          sToken: jwt.sign({ _id: (admin._id).toHexString(), eType: admin.eType, sLatitude: admin?.sLatitude || '', sLongitude: admin?.sLongitude || '' }, config.JWT_SECRET, { expiresIn: config.JWT_VALIDITY }),
          sIpAddress: getIp(req),
          sPushToken
        }

        // Admin can login in LOGIN_HARD_LIMIT_ADMIN time.
        // for e.g. LOGIN_HARD_LIMIT_ADMIN=5 -> Admin can login only for 5 times, After that we'll remove first login token from db.
        if (admin.aJwtTokens.length < config.LOGIN_HARD_LIMIT_ADMIN || config.LOGIN_HARD_LIMIT_ADMIN === 0) {
          admin.aJwtTokens.push(newToken)
        } else {
          admin.aJwtTokens.splice(0, 1)
          admin.aJwtTokens.push(newToken)
        }

        admin.dLoginAt = new Date()
        await admin.save()

        const ePlatform = ['a', 'i', 'w'].includes(req.header('Platform')) ? req.header('Platform') : 'o'

        await AdminAuthLogsModel.create({ iAdminId: admin._id, ePlatform, eType: 'l', sDeviceToken, sIpAddress: getIp(req) })

        admin = AdminsModel.filterData(admin)
        if (admin.sEmail) admin.sEmail = await decryptValuePromise(admin.sEmail)
        if (admin.sMobNum) admin.sMobNum = await decryptValuePromise(admin.sMobNum)

        return res.status(status.OK).set({ Authorization: newToken.sToken, RefreshToken: sRefreshToken }).jsonp({
          status: jsonStatus.OK,
          message: messages[req.userLanguage].succ_login,
          data: admin,
          Authorization: newToken.sToken,
          RefreshToken: sRefreshToken
        })
      }
    } catch (error) {
      console.log(11, error)
      return res.status(500).json({ error })
    }
  }

  /**
   * New version of verify otp for Verifying otp for admin login. add location feature
   * @body {*} req  'sLogin', 'sType', 'sAuth', 'sCode', 'sDeviceToken', 'sLatitude', 'sLongitude'.
   * @param {*} res  verify otp with Login successful message with jwt token
   * @returns verify otp with Login successful message with jwt token
   */
  async verifyOTPV2 (req, res) {
    try {
      req.body = pick(req.body, ['sLogin', 'sType', 'sAuth', 'sCode', 'sDeviceToken', 'sLatitude', 'sLongitude'])
      let { sLogin, sType, sAuth, sCode, sDeviceToken, sPushToken, sLatitude, sLongitude } = req.body
      removeNull(req.body)

      // const isLocationValid = await checkLocationValidity(req, res, sLatitude, sLongitude)
      // if (isLocationValid) {
      //   return res.status(status.badRequest).jsonp({
      //     status: jsonStatus.badRequest,
      //     message: messages[req.userLanguage].location_details_required
      //   })
      // }

      // sCode = parseInt(sCode)
      // const isCodeValid = await checkCodeValidity(req, res, sCode)
      // if (isCodeValid) {
      //   const errorMessage = messages[req.userLanguage].verify_otp_err
      //   return res.status(status.badRequest).jsonp({
      //     status: jsonStatus.badRequest,
      //     message: errorMessage
      //   })
      // }

      const envs = ['production', 'staging']
      const checkEnv = envs.includes(process.env.NODE_ENV)
      // check rate limit for otp verify from same ip at multiple time. we'll make sure not too many request from same ip will occurs.
      if (checkEnv) {
        const rateLimit = await checkRateLimitOTP(sLogin, sType, `${sAuth}-V`)
        if (rateLimit === 'LIMIT_REACHED') return res.status(status.tooManyRequest).jsonp({ status: jsonStatus.tooManyRequest, message: messages[req.userLanguage].limit_reached.replace('##', messages[req.userLanguage].cotpVerification) })
      }
      sLogin = await encryptKeyPromise(sLogin)
      const exist = await OTPVerificationsModel.findOne({ sLogin: req.body.sLogin }).sort({ dCreatedAt: -1 }).lean()
      const checkExist = (!exist || (exist.sCode !== sCode))
      if (checkExist) return res.status(status.badRequest).jsonp({ status: jsonStatus.badRequest, message: messages[req.userLanguage].verify_otp_err })

      const platforms = ['a', 'i', 'w']
      const platformHeader = req.header('Platform')
      const isPlatformIncluded = platforms.includes(platformHeader)
      const ePlatform = isPlatformIncluded ? platformHeader : 'o'
      const [, AdminDetails = {}] = await Promise.all([
        OTPVerificationsModel.findByIdAndUpdate(exist._id, { bIsVerify: true }, { runValidators: true }).lean(),
        AdminsModel.findById(exist.iAdminId, null, { readPreference: 'primary' }).populate({ path: 'aRole' }).lean()
      ])

      const sNewLatitude = sLatitude || ''
      const sNewLongitude = sLongitude || ''

      const sRefreshToken = jwt.sign({ _id: (AdminDetails._id).toHexString(), eType: AdminDetails.eType, sLatitude: sNewLatitude, sLongitude: sNewLongitude }, config.REFRESH_TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_VALIDITY })

      const newToken = {
        sToken: jwt.sign({ _id: (AdminDetails._id).toHexString(), eType: AdminDetails.eType, sLatitude: sNewLatitude, sLongitude: sNewLongitude }, config.JWT_SECRET, { expiresIn: config.JWT_VALIDITY }),
        sPushToken,
        sLatitude,
        sLongitude
      }
      const isLoginHardLimitAdmin = ((AdminDetails.aJwtTokens.length < config.LOGIN_HARD_LIMIT_ADMIN) || config.LOGIN_HARD_LIMIT_ADMIN === 0)
      if (isLoginHardLimitAdmin) {
        AdminDetails.aJwtTokens.push(newToken)
      } else {
        AdminDetails.aJwtTokens.splice(0, 1)
        AdminDetails.aJwtTokens.push(newToken)
      }
      await Promise.all([
        AdminsModel.updateOne({ _id: new ObjectId(AdminDetails._id) }, { aJwtTokens: AdminDetails.aJwtTokens, dLoginAt: new Date(), bLoggedOut: false }),
        AdminAuthLogsModel.create({ iAdminId: AdminDetails._id, ePlatform, eType: exist.sAuth, sDeviceToken, sIpAddress: getIp(req) })
      ])

      AdminsModel.filterData(AdminDetails)
      await decryptIfExist(AdminDetails, ['sEmail', 'sMobNum'])

      return res.status(status.OK).set({ Authorization: newToken.sToken, RefreshToken: sRefreshToken }).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].verification_success, data: AdminDetails, Authorization: newToken.sToken, RefreshToken: sRefreshToken })
    } catch (error) {
      return catchError('AdminAuth.verifyOTPV2', error, req, res)
    }
  }

  /**
   * Logout admin from admin panel
   * @param {*} req  admin id
   * @param {*} res  logout message
   * @returns logout message
   */
  async logout (req, res) {
    try {
      // We'll remove auth token from db at logout time
      await AdminsModel.updateOne({ _id: new ObjectId(req.admin._id) }, { $pull: { aJwtTokens: { sToken: req.header('Authorization') } }, bLoggedOut: true })
      return res.status(status.OK).jsonp({
        status: jsonStatus.OK,
        message: messages[req.userLanguage].succ_logout
      })
    } catch (error) {
      console.log(error)
      return catchError('AdminAuth.logout', error, req, res)
    }
  }

  /**
  * Give you a Admin Authorization token to run test script.
  * @returns Authorization token.
  */
  // async getAdminToken () {
  //   let response
  //   try {
  //     const result = await axios.post(`${config.DEPLOY_HOST_URL}/api/admin/auth/login/v1`, { // v1 api for admin login already deprecated, need to check
  //       sLogin: testCasesDefault.superAdmin.sLogin,
  //       sPassword: testCasesDefault.superAdmin.sPassword
  //     })
  //     response = result.data.Authorization
  //   } catch (error) {
  //     return catchError('AdminAuth.getAdminToken', error, '', '')
  //   }
  //   return response
  // }

  /**
   * This api is used for getting new token from refreshToken for admin as we will process login in background if the jwt token expires
  */
  async refreshToken (req, res) {
    try {
      const sRefreshToken = req.header('RefreshToken')
      // const sOldToken = req.header('Authorization')
      if (sRefreshToken) {
        const admin = await AdminsModel.findByRefreshToken(sRefreshToken)
        if (!admin) return res.status(status.unauthorized).json({ status: jsonStatus.unauthorized, message: messages[req.userLanguage].err_unauthorized })
        const sToken = jwt.sign({ _id: (admin._id).toHexString(), eType: admin.eType }, config.JWT_SECRET, { expiresIn: config.JWT_VALIDITY })
        const newToken = {
          sToken
          // sIpAddress: getIp(req)
        }
        if (admin.aJwtTokens.length < config.LOGIN_HARD_LIMIT_ADMIN || config.LOGIN_HARD_LIMIT_ADMIN === 0) {
          admin.aJwtTokens.push(newToken)
        } else {
          admin.aJwtTokens.splice(0, 1)
          admin.aJwtTokens.push(newToken)
        }

        await AdminsModel.updateOne({ _id: ObjectId(admin._id) }, { aJwtTokens: admin.aJwtTokens, dLoginAt: new Date() })

        return res.set({ Authorization: sToken, RefreshToken: sRefreshToken }).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].generate_success.replace('##', messages[req.userLanguage].cToken), Authorization: sToken, RefreshToken: sRefreshToken })
      }
    } catch (err) {
      return catchError('AdminAuth.refreshToken', err, req, res)
    }
  }
}

module.exports = new AdminAuth()
