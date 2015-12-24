'use strict';
var mongoose = require('mongoose');
var mongoConfig = require('../config/mongo.json');

mongoose.con = function () {
  mongoose.connect('mongodb://' + mongoConfig.user + ':' + mongoConfig.password + '@' + mongoConfig.url + ':' + mongoConfig.port + '/' + mongoConfig.db);
};

mongoose.constants = {
  NUMBER:"NUMBER",
  TEXT:"TEXT"
};

module.exports = mongoose;