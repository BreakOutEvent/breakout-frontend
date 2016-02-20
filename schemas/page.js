'use strict';
var mongoose = require('mongoose');
var viewSchema = require('./view.js');

var pageSchema = new mongoose.Schema({
  title: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'languagetovalue'
  }],
  url: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'languagetovalue'
  }],
  views: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'view'
  }]
});

pageSchema.pre('remove', function(next) {
  this.views.forEach(function(view) {
    viewSchema.remove({_id: view._id}).exec();
  });
  next();
});

module.exports = pageSchema;