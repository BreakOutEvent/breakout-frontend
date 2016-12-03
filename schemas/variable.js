'use strict';
var mongoose = require('mongoose');
var l2vSchema = require('../schemas/languagetovalue.js');

var variableSchema =  new mongoose.Schema({
  name: { type: String, required: true },
  values: [l2vSchema],
});

variableSchema.pre('remove', function (next) {
  this.values.forEach(function (l2v) {
    l2vSchema.remove({ _id: l2v._id }).exec();
  });

  next();
});

module.exports = variableSchema;
