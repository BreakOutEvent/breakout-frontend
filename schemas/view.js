var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  templateName: {type: String, required: true},
  values: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'variable'
  }]
});