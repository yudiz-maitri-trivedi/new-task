const generalEnglish = require('../lang/english/general')
const generalHindi = require('../lang/hindi/general')
const wordsEnglish = require('../lang/english/words')
const wordsHindi = require('../lang/hindi/words')

const messages = {
  English: {
    ...generalEnglish,
    ...wordsEnglish
  },
  Hindi: {
    ...generalHindi,
    ...wordsHindi
  }
}

const status = {
  OK: 200,
  create: 201,
  deleted: 204,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  forbidden: 403,
  notAcceptable: 406,
  expectationFailed: 417,
  locked: 423,
  internalServerError: 500,
  unprocessableEntity: 422,
  resourceExist: 409,
  tooManyRequest: 429
}

const jsonStatus = {
  OK: 200,
  create: 201,
  deleted: 204,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  forbidden: 403,
  notAcceptable: 406,
  expectationFailed: 417,
  locked: 423,
  internalServerError: 500,
  unprocessableEntity: 422,
  resourceExist: 409,
  tooManyRequest: 429
}

module.exports = {
  messages,
  status,
  jsonStatus
}
