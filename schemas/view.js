'use strict';

var mongoose = require('mongoose');
var variableSchema = requireLocal('schemas/variable.js');

var viewSchema = new mongoose.Schema({
  templateName: { type: String, required: true },
  variables: [variableSchema],
});

viewSchema.pre('remove', function (next) {
  this.variables.forEach(function (variable) {
    variableSchema.remove({ _id: variable._id }).exec();
  });

  next();
});

module.exports = viewSchema;
