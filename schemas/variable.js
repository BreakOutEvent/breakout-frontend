var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  type: String,
  maxlen: Number,
  minlen: Number,
  maxwidth: Number,
  minwidth: Number,
  child: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'variable'
  }]
});