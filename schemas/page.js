var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
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