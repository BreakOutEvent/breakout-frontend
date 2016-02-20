'use strict';
var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
  properties: [{
    language: {type: mongoose.Schema.Types.Lang, required: true},
    title: {type: String, required: true},
    _page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'page'
    }
  }]
});

module.exports = itemSchema;