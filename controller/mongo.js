'use strict';
var mongoose = require('mongoose');
var mongoConfig = {
  "user": process.env.FRONTEND_DB_USER,
  "password": process.env.FRONTEND_DB_PASSWORD,
  "url": process.env.FRONTEND_DB_URL,
  "port": process.env.FRONTEND_DB_PORT,
  "db": process.env.FRONTEND_DB_NAME
};

mongoose.con = function () {
  mongoose.connect('mongodb://' + mongoConfig.user + ':' + mongoConfig.password + '@' + mongoConfig.url + ':' + mongoConfig.port + '/' + mongoConfig.db);
};

mongoose.constants = {
  NUMBER:"NUMBER",

  TEXT:"TEXT"
};

function Lang(key, options) {
  mongoose.SchemaType.call(this, key, options, 'Lang');
}
Lang.prototype = Object.create(mongoose.SchemaType.prototype);

// `cast()` takes a parameter that can be anything. You need to
// validate the provided `val` and throw a `CastError` if you
// can't convert it.
Lang.prototype.cast = function(val) {

  var possibleLangs = ['en','de'];

  var _val = String(val).toLowerCase();

  if (_val === "") {
    throw new mongoose.SchemaType.CastError('Lang', _val + ' is not a String or empty');
  }
  if (possibleLangs.indexOf(_val) === -1) {
    throw new mongoose.SchemaType.CastError('Lang', _val + ' is not a valid language');
  }

  return _val;
};

Lang.prototype.checkRequired = function(value) {
  return !!(value && value.length);
};

// Don't forget to add `Int8` to the type registry
mongoose.Schema.Types.Lang = Lang;


module.exports = mongoose;