const mongoose = require('mongoose')
const { AdminsDBConnect } = require('../../../database/mongoose')
const { eAdminPermission, eAdminPermissionType, ePermissionModule, eStatus } = require('../../../enum')

const Roles = new mongoose.Schema({
  sName: { type: String, required: true },
  aPermissions: [{
    sKey: { type: String, enum: eAdminPermission.values },
    eType: { type: String, enum: eAdminPermissionType.values }, // R = READ, W = WRITE, N = NONE - Rights
    sModuleName: { type: String, enum: ePermissionModule.values }
  }],
  eStatus: { type: String, enum: eStatus.values, default: eStatus.default }
}, { timestamps: { createdAt: 'dCreatedAt', updatedAt: 'dUpdatedAt' } })

const RolesModel = AdminsDBConnect.model('roles', Roles)

RolesModel.syncIndexes().then(() => {
  console.log('Roles Model Indexes Synced')
}).catch((err) => {
  console.log('Roles Model Indexes Sync Error', err)
})

module.exports = RolesModel
