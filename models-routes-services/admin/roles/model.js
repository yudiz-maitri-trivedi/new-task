/* eslint-disable no-console */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { AdminsDBConnect } = require('../../../database/mongoose')
const { eStatus, eAdminPermission, eAdminPermissionType, ePermissionModule } = require('../../../enum')

const Roles = new Schema({
  sName: { type: String, required: true },
  aPermissions: [{
    sKey: { type: String, enum: eAdminPermission },
    eType: { type: String, enum: eAdminPermissionType }, // R = READ, W = WRITE, N = NONE - Rights
    sModuleName: { type: String, enum: ePermissionModule }
  }],
  eStatus: { type: String, enum: eStatus, default: 'a' },
  sExternalId: { type: String }
}, { timestamps: { createdAt: 'dCreatedAt', updatedAt: 'dUpdatedAt' } })

Roles.index({ 'aPermissions.sKey': 1 })
Roles.index({ eStatus: 1 })
Roles.index({ sName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })

const RolesModel = AdminsDBConnect.model('roles', Roles)
RolesModel.syncIndexes().then(() => {
  console.log('Roles Model Indexes Synced')
}).catch((err) => {
  console.log('Roles Model Indexes Sync Error', err)
})
module.exports = RolesModel
