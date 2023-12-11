const router = require('express').Router()
const adminAuthServices = require('./services')
const validators = require('./validators')
const { validateAdmin, validate, isAdminAuthenticated, decrypt } = require('../../../middleware/middleware')

router.post('/admin/auth/login/v4', validators.adminLoginV4, validate, adminAuthServices.loginV3)

router.post('/admin/auth/verify-otp/v2', validators.verifyOTP, validate, adminAuthServices.verifyOTPV2)
// router.post('/admin/auth/sub-admin/v4', validators.createSubAdminV4, validateAdmin('SUBADMIN', 'W'), decrypt, adminAuthServices.createSubAdminV4)

router.put('/admin/auth/logout/v1', isAdminAuthenticated, adminAuthServices.logout)
router.get('/admin/auth/refresh-token/v1', adminAuthServices.refreshToken)

module.exports = router
