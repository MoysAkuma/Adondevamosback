// validations/countriesValidations.js
const { body } = require('express-validator');

exports.validateCreateCountry = [
  body('name').not().isEmpty().trim().escape(),
  body('acronym').not().isEmpty().trim().escape()
];

exports.validateUpdateCountry = [
  body('name').not().isEmpty().trim().escape(),
  body('acronym').not().isEmpty().trim().escape()
];