var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  name: {type: String, required: true},
  vars: [{
    name: String,
    title: String,
    description: String,
    contentType: String,
    contentMaxLength: Number
  }]
});