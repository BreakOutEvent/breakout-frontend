var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  properties: [{
    language: {type: String, required: true},
    title: {type: String, required: true},
    url: {type: String, required: true}
  }],
  views: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'view'
  }]
});