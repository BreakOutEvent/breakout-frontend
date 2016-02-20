var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  language: {type: String, required: true},
  value: {type: String, required: true}
});