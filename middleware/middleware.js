// const Crypt = require('hybrid-crypto-js').Crypt
// const crypt = new Crypt()
const AdminsModel = require('../models-routes-services/admin/model')
const RolesModel = require('../models-routes-services/admin/roles/model')
const { status, messages, jsonStatus } = require('../helper/api.responses')
const { validationResult } = require('express-validator')
// const { PRIVATE_KEY } = require('../config/config')
const jwt = require('jsonwebtoken')
const ObjectId = require('mongoose').Types.ObjectId
const config = require('../config/config')

const validateAdmin = (sKey, eType) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(status.unauthorized).jsonp({
          status: jsonStatus.unauthorized,
          message: messages[req.userLanguage].err_unauthorized
        })
      }
      let admin
      try {
        admin = await AdminsModel.findByToken(token)
      } catch (err) {
        return res.status(status.unauthorized).jsonp({
          status: jsonStatus.unauthorized,
          message: messages[req.userLanguage].err_unauthorized
        })
      }
      if (!admin) {
        return res.status(status.unauthorized).jsonp({
          status: jsonStatus.unauthorized,
          message: messages[req.userLanguage].err_unauthorized
        })
      }
      req.admin = admin

      let errors
      if (req.admin.eType === 'SUPER') {
        errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(status.unprocessableEntity).jsonp({
            status: jsonStatus.unprocessableEntity,
            errors: errors.array()
          })
        }
        return next(null, null)
      } else {
        if (!req.admin.aRole) return res.status(status.unauthorized).jsonp({ status: jsonStatus.unauthorized, message: messages[req.userLanguage].access_denied })
        const aRoles = await RolesModel.find({ _id: { $in: req.admin.aRole }, eStatus: 'a' }, { aPermissions: 1 }).lean()
        if (!aRoles?.length) return res.status(status.unauthorized).jsonp({ status: jsonStatus.unauthorized, message: messages[req.userLanguage].access_denied })
        let aPermissions = aRoles.map(role => role.aPermissions)
        aPermissions = [].concat.apply([], aPermissions)
        const hasPermission = aPermissions.find((permission) => {
          return (
            permission.sKey === sKey &&
            (permission.eType === eType ||
              (eType === 'R' && permission.eType === 'W'))
          )
        })

        if (!hasPermission) {
          let hasSubAdminPermission
          if (sKey === 'DEPOSIT' && eType === 'W') {
            hasSubAdminPermission = aRoles.aPermissions.find((permission) => {
              return (
                permission.sKey === 'SYSTEM_USERS' && permission.eType === 'W'
              )
            })
          }
          if (!hasSubAdminPermission) {
            let message

            switch (eType) {
              case 'R':
                message = messages[req.userLanguage].read_access_denied.replace('##', sKey)
                break
              case 'W':
                message = messages[req.userLanguage].write_access_denied.replace('##', sKey)
                break
              case 'N':
                message = messages[req.userLanguage].access_denied
                break
              default:
                message = messages[req.userLanguage].access_denied
                break
            }

            return res.status(status.unauthorized).jsonp({
              status: jsonStatus.unauthorized,
              message
            })
          }
        }
        errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(status.internalServerError).jsonp({
            status: jsonStatus.internalServerError,
            message: messages[req.userLanguage].error
          })
        }

        return next(null, null)
      }
    } catch (error) {
      return res.status(status.internalServerError).jsonp({
        status: jsonStatus.internalServerError,
        message: messages[req.userLanguage].error
      })
    }
  }
}

const isAdminAuthenticated = async (req, res, next) => {
  try {
    const token = req.header('Authorization')
    if (!token) {
      return res.status(status.unauthorized).jsonp({
        status: jsonStatus.unauthorized,
        message: messages[req.userLanguage].err_unauthorized
      })
    }
    const admin = await AdminsModel.findByToken(token)
    if (!admin) {
      return res.status(status.unauthorized).jsonp({
        status: jsonStatus.unauthorized,
        message: messages[req.userLanguage].err_unauthorized
      })
    }
    req.admin = admin

    return next(null, null)
  } catch (error) {
    return res.status(status.internalServerError).jsonp({
      status: jsonStatus.internalServerError,
      message: messages[req.userLanguage].error
    })
  }
}

// const isAdminAuthenticatedToDeposit = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')
//     if (!token) {
//       return responseMessage(req, res, 'unAuthorized', 'err_unauthorized')
//     }
//     const admin = await AdminsModel.findByDepositToken(token)
//     if (!admin) {
//       return responseMessage(req, res, 'unAuthorized', 'err_unauthorized')
//     }
//     req.admin = admin

//     return next(null, null)
//   } catch (error) {
//     return responseMessage(req, res, 'UnprocessableEntity', '', '', { errors: error.array() })
//   }
// }

const isAdminAuthorized = (sKey, eType) => {
  return async function (req, res, next) {
    if (req.admin.eType === 'SUPER') {
      next()
    } else {
      if (!req.admin.aRole) return res.status(status.unauthorized).jsonp({ status: jsonStatus.unauthorized, message: messages[req.userLanguage].access_denied })
      const aRole = await RolesModel.find({ _id: { $in: req.admin.aRole }, eStatus: 'Y' }, { aPermissions: 1 }).lean()
      if (!aRole) return res.status(status.unauthorized).jsonp({ status: jsonStatus.unauthorized, message: messages[req.userLanguage].access_denied })
      let aPermissions = aRole.map(roles => roles.aPermissions)
      aPermissions = [].concat.apply([], aPermissions)
      const hasPermission = aPermissions.find((permission) => {
        return (
          permission.sKey === sKey &&
          (permission.eType === eType ||
            (eType === 'R' && permission.eType === 'W'))
        )
      })

      if (!hasPermission) {
        let message

        switch (eType) {
          case 'R':
            message = messages[req.userLanguage].read_access_denied.replace('##', sKey)
            break
          case 'W':
            message = messages[req.userLanguage].write_access_denied.replace('##', sKey)
            break
          case 'N':
            message = messages[req.userLanguage].access_denied
            break
          default:
            message = messages[req.userLanguage].access_denied
            break
        }

        return res.status(status.unauthorized).jsonp({
          status: jsonStatus.unauthorized,
          message
        })
      }
      next()
    }
  }
}

const validate = function (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(status.unprocessableEntity)
      .jsonp({ status: jsonStatus.unprocessableEntity, errors: errors.array() })
  }
  next()
}

const decryption = function (password) {
  const decrypted = crypt.decrypt(PRIVATE_KEY, password)
  const decryptedData = decrypted.message
  return decryptedData.toString()
}
const decrypt = function (req, res, next) {
  const { sPassword, sOldPassword, sNewPassword } = req.body
  if (sPassword) {
    req.body.sPassword = decryption(sPassword)
  } else if (sOldPassword && sNewPassword) {
    req.body.sOldPassword = decryption(sOldPassword)
    req.body.sNewPassword = decryption(sNewPassword)
  } else if (!sOldPassword && sNewPassword) {
    req.body.sNewPassword = decryption(sNewPassword)
  }
  next()
}

const isUserAuthenticated = (req, res, next) => {
  try {
    const token = req.header('Authorization')
    if (!token) {
      return res.status(status.unauthorized).jsonp({
        status: jsonStatus.unauthorized,
        message: messages[req.userLanguage].err_unauthorized
      })
    }
    req.user = {}
    let user
    try {
    //   user = await UsersModel.findByToken(token)
      user = jwt.verify(token, config.JWT_SECRET_USER)
    } catch (err) {
      return res.status(status.unauthorized).jsonp({
        status: jsonStatus.unauthorized,
        message: messages[req.userLanguage].err_unauthorized
      })
    }

    if (!user) {
      return res.status(status.unauthorized).jsonp({
        status: jsonStatus.unauthorized,
        message: messages[req.userLanguage].err_unauthorized
      })
    }
    // 2 means user.eType = 'B'
    if (user.eType === '2') {
      return res.status(status.notFound).jsonp({ status: jsonStatus.notFound, message: messages[req.userLanguage].user_blocked })
    }
    // await redisClient.hset(`at:${token}`, '_id', user._id.toString())
    // await redisClient.expire(`at:${token}`, 86400)
    req.user = user
    req.user._id = ObjectId(user._id)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(status.unprocessableEntity).jsonp({
        status: jsonStatus.unprocessableEntity,
        errors: errors.array()
      })
    }
    return next(null, null)
  } catch (error) {
    return res.status(status.internalServerError).jsonp({
      status: jsonStatus.internalServerError,
      message: messages[req.userLanguage].error
    })
  }
}

module.exports = {
  validateAdmin,
  validate,
  decrypt,
  decryption,
  isAdminAuthorized,
  isAdminAuthenticated,
  isUserAuthenticated
}
