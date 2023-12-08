const { connection } = require('./database/mongoose')
const Admin = require('./models-routes-services/admin/model')
const fs = require('fs')
const filePath = '.data.json'
const config = require('./config/config')

connection(config.ADMINS_DB_URL, 'Admins')

const seedDatabase = async (sFilePath, sModel, flag) => {
  try {
    if (!fs.existsSync(sFilePath)) {
      throw new Error('File does not exist at this location.')
    }
    const data = fs.readFileSync(sFilePath)
    const parsedData = JSON.parse(data)

    if (flag) {
      await sModel.bulkWrite(
        [
          { deleteMany: { filter: {} } },
          ...parsedData.data.map((document) => ({ insertOne: { document } }))
        ],
        { ordered: true }
      )
    } else {
      await sModel.bulkWrite([...parsedData.data.map((document) => ({ insertOne: { document } }))])
    }
    console.log('Database seeded successfully')
  } catch (error) {
    console.log('Failed to seed database', error)
  }
}

seedDatabase(filePath, Admin)
