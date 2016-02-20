var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  language: {type: mongoose.Schema.Types.Lang, required: true},
  value: {type: String, required: true}
});