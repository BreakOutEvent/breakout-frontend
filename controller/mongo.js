'use strict';
var mongoose = require('mongoose');
var mongoConfig = require('../config/mongo.json');

module.exports = {
  this: mongoose,
  con: function () {
    mongoose.connect('mongodb://' + mongoConfig.user + ':' + mongoConfig.password + '@' + mongoConfig.url + ':' + mongoConfig.port + '/' + mongoConfig.db);
  },
  schemas: {
    "template": new mongoose.Schema({
      title: {type: String, required: true},
      vars: {type: String, required: true}
    }),
    "view": new mongoose.Schema({
      title: {type: String, required: true},
      template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'template'
      }
    }),
    "page": new mongoose.Schema({
      title: {type: String, required: true},
      url: {type: String, required: true},
      views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'view'
      }]
    })
  }
};