const PermissionsModel = require('./model')
const RoleModel = require('../roles/model')
const { messages, status, jsonStatus } = require('../../../helper/api.responses')
const { removenull, catchError, pick } = require('../../../helper/utilityServices')

class Permission {
  /**
   * add permission in database
   * @body {*} req 'sName', 'sKey', 'eStatus'
   * @param {*} res permission details with message
   * @returns message with Permission details
   */
  async add (req, res) {
    try {
      req.body = pick(req.body, ['sName', 'sKey', 'eStatus', 'sModuleName'])
      removenull(req.body)
      const { sKey } = req.body
      const oPermissionExist = await PermissionsModel.findOne({ sKey }).lean()
      if (oPermissionExist) return res.status(status.resourceExist).jsonp({ status: jsonStatus.resourceExist, message: messages[req.userLanguage].already_exist.replace('##', messages[req.userLanguage].permission) })

      const oData = await PermissionsModel.create({ ...req.body })

      // We'll update all roles with assigning new permissions of none(Not Read + Not Write) rights
      await RoleModel.updateMany({ }, { $push: { aPermissions: { sKey, eType: 'N' } } })

      return res.status(status.OK).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].add_success.replace('##', messages[req.userLanguage].permission), oData })
    } catch (error) {
      return catchError('Permission.add', error, req, res)
    }
  }

  /**
   * getting All permissions from database
   * @param {*} res all permissions details with message
   * @returns message with all Permissions details
   */
  async adminList (req, res) {
    try {
      const oData = await PermissionsModel.find().lean()

      return res.status(status.OK).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].success.replace('##', messages[req.userLanguage].permissions), oData })
    } catch (error) {
      return catchError('Permission.adminList', error, req, res)
    }
  }

  /**
   * getting All active permissions from database
   * @param {*} res all active permissions details with message
   * @returns message with all active Permissions details
   */
  async list (req, res) {
    try {
      const data = await PermissionsModel.find({ eStatus: 'a' }).lean()

      return res.status(status.OK).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].success.replace('##', messages[req.userLanguage].permissions), data })
    } catch (error) {
      return catchError('Permission.list', error, req, res)
    }
  }

  /**
   * get single permission from database
   * @param {*} req permission id
   * @param {*} res single permission detail with message
   * @returns message with single Permission detail
   */
  async get (req, res) {
    try {
      const oData = await PermissionsModel.findById(req.params.id).lean()

      if (!oData) return res.status(status.notFound).jsonp({ status: jsonStatus.notFound, message: messages[req.userLanguage].not_exist.replace('##', messages[req.userLanguage].permission) })

      return res.status(status.OK).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].success.replace('##', messages[req.userLanguage].permissions), oData })
    } catch (error) {
      return catchError('Permission.list', error, req, res)
    }
  }

  /**
   * update single permission from database
   * @param {*} req permission id
   * @body  {*} req 'sName', 'sKey', 'eStatus'
   * @param {*} res update permission detail with message
   * @returns message with update Permission detail
   */
  async update (req, res) {
    try {
      req.body = pick(req.body, ['sName', 'sKey', 'eStatus'])

      const oData = await PermissionsModel.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true, runValidators: true }).lean()
      if (!oData) return res.status(status.notFound).jsonp({ status: jsonStatus.notFound, message: messages[req.userLanguage].not_exist.replace('##', messages[req.userLanguage].permission) })

      return res.status(status.OK).jsonp({ status: jsonStatus.OK, message: messages[req.userLanguage].update_success.replace('##', messages[req.userLanguage].permission), oData })
    } catch (error) {
      return catchError('Permission.update', error, req, res)
    }
  }
}

module.exports = new Permission()
