var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  title: {type: String, required: true},
  vars: [{
    title: String,
    description: String,
    contentType: String,
    contentMaxLength: Number
  }]
});