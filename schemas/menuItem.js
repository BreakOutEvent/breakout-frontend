'use strict';
var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
  title: {type: String, required: true},
  _page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'page'
  }
});

module.exports = itemSchema;
