'use strict';

var mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
  accessToken: String,
  tokenType : String,
  refreshToken : String,
  expiresIn: Number,
  scope: String
});

TokenSchema.statics.findById = function (id) {
  var tokenSchema = this;

  return new Promise(function (resolve, reject) {
    tokenSchema.findOne({'_id': id}, function (err, token) {
      if (err) {
        throw err;
      }
      if (token) {
        resolve(token);
      } else {
        reject(new Error('Token ' + id + ' does not exist'));
      }
    });
  });
};

module.exports = TokenSchema;