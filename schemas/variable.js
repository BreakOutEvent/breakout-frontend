var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  name: {type: String, required: true},
  values: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'languagetovalue'
  }]
});