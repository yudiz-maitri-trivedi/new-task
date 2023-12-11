const mongoose = require('mongoose')
const { AdminsDBConnect } = require('../../../database/mongoose')
const { ePermissionModule, eStatus } = require('../../../enum')

const Permissions = new mongoose.Schema({
  sName: { type: String, required: true },
  sKey: { type: String, required: true },
  // sModuleName: { type: String, enum: ePermissionModule.values, required: true }, // every permission belongs to specific module, to make things dynamic we are adding this field.
  eStatus: { type: String, enum: eStatus.values, default: eStatus.default }
}, { timestamps: { createdAt: 'dCreatedAt', updatedAt: 'dUpdatedAt' } })

Permissions.index({ sKey: 1 })
Permissions.index({ eStatus: 1 })

const PermissionsModel = AdminsDBConnect.model('permissions', Permissions)

PermissionsModel.syncIndexes().then(() => {
  console.log('Permissons Model Indexes Synced')
}).catch((err) => {
  console.log('Permissons Model Indexes Sync Error', err)
})

module.exports = PermissionsModel
