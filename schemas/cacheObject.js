'use strict';
var mongoose = require('mongoose');

var cacheObject = new mongoose.Schema({
  key: {type: String, unique: true},
  expiration: Number,
  content: String,
  updating: Boolean
});

module.exports = cacheObject;
