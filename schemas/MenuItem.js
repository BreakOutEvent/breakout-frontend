'use strict';
var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
  properties: [{
    language: {type: mongoose.Schema.Types.Lang, required: true},
    title: {type: String, required: true},
    url: {type: String, required: true}
  }]
});

module.exports = itemSchema;