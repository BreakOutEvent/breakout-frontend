var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  templatename: {type: String, required: true},
  values: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'variable'
  }]
});