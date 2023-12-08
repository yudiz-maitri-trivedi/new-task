const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { AdminsDBConnect } = require('../../database/mongoose')
const data = require('../../enum')
const AdminModel = require('./model')

const OTPVerifications = new Schema({
  sLogin: { type: String, trim: true, required: true },
  sCode: { type: Number, required: true },
  sType: { type: String, enum: data.eOtpType.values, required: true }, // E = Email | M = Mobile
  sAuth: { type: String, enum: data.eOtpAuth.values, required: true }, // R = Register | F = ForgotPass | V = Verification | L = Login
  sDeviceToken: { type: String },
  iAdminId: { type: Schema.Types.ObjectId, ref: AdminModel },
  bIsVerify: { type: Boolean, default: false },
  dUpdatedAt: { type: Date },
  dCreatedAt: { type: Date, default: Date.now },
  sExternalId: { type: String }
})
OTPVerifications.index({ sLogin: 1, sCode: 1, sType: 1 })

module.exports = AdminsDBConnect.model('otpverifications', OTPVerifications)
