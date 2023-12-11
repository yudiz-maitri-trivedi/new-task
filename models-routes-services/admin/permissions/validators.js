const { body } = require('express-validator')
const { eStatus, eAdminPermission } = require('../../../enum')

const permissionAdd = [
  body('sName').not().isEmpty(),
  body('sKey').not().isEmpty().isIn(eAdminPermission.values)
]

const permissionUpdate = [
  body('sName').not().isEmpty(),
  body('sKey').not().isEmpty().isIn(eAdminPermission),
  body('eStatus').not().isEmpty().toUpperCase().isIn(eStatus.values)
]

module.exports = {
  permissionAdd,
  permissionUpdate
}
