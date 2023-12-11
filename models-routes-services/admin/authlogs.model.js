const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { AdminsDBConnect } = require('../../database/mongoose')
const { ePlatform, eAdminLogTypes } = require('../../enum')
const AdminModel = require('./model')

const AdminAuthLogs = new Schema({
  iAdminId: { type: Schema.Types.ObjectId, ref: AdminModel },
  ePlatform: { type: String, enum: ePlatform.values, required: true }, // A = Android, I = iOS, W = Web, O = Other, AD = Admin
  eType: { type: String, enum: eAdminLogTypes.values }, // L = Login, PC = Password Change, RP = Reset Password
  sDeviceToken: { type: String },
  sIpAddress: { type: String },
  dUpdatedAt: { type: Date },
  dCreatedAt: { type: Date, default: Date.now },
  sExternalId: { type: String }
})

AdminAuthLogs.index({ iAdminId: 1 })

module.exports = AdminsDBConnect.model('adminauthlogs', AdminAuthLogs)
