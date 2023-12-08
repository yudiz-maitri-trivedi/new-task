const { status, jsonStatus } = require('../helper/api.responses')
// const { DISABLE_ADMIN_ROUTES } = require('../config/config')
// const swaggerUI = require('swagger-ui-express')
// const swaggerFile = require('../helper/swagger_output.json')
// const { isDocAuthenticated } = require('./middleware')

module.exports = (app) => {
  app.use('/api/administrator', [
    require('../models-routes-services/admin/auth/routes'),
    require('../models-routes-services/admin/permissions/routes'),
    // require('../models-routes-services/admin/subAdmin/routes'),
    require('../models-routes-services/admin/roles/routes')
  ])

  app.get('/health-check', (req, res) => {
    const sDate = new Date().toJSON()
    return res.status(status.OK).jsonp({ status: jsonStatus.OK, sDate })
  })

  app.get('*', (req, res) => {
    return res.status(status.notFound).jsonp({ status: status.notFound })
  })
}
