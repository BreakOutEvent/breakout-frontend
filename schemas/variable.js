var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  name: {type: String, required: true},
  values: [{
    language: {type: String, required: true},
    value: {type: String, required: true}
  }]
});