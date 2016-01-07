var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  title: {type: String, required: true},
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'template'
  },
  values: []
});