const { body } = require('express-validator')

const adminLoginV4 = [
  body('sLogin').not().isEmpty(),
  body('sPassword').not().isEmpty().optional()
]

const createSubAdminV4 = [
  body('sName').not().isEmpty(),
  body('sUsername').not().isEmpty(),
  body('sEmail').isEmail().not().isEmpty().escape(),
  body('sMobNum').not().isEmpty(),
  body('sPassword').not().isEmpty(),
  body('aRole').not().isEmpty()
]

const verifyOTP = [
  body('sLogin').not().isEmpty(),
  body('sAuth').not().isEmpty(),
  body('sType').not().isEmpty(),
  body('sCode').isNumeric()
]

module.exports = {
  verifyOTP,
  createSubAdminV4,
  adminLoginV4
}
