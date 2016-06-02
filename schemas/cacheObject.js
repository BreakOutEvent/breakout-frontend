'use strict';
var mongoose = require('mongoose');

var cacheObject = new mongoose.Schema({
  key: String,
  expiration: Number,
  content: String,
  updating: Boolean
});

module.exports = cacheObject;
