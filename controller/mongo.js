'use strict';

const mongoose = require('mongoose');
const config = requireLocal('config/config.js');

// Build connection URL dependent on whether a user is specified or not
function buildMongoUrl(user, password, database, host) {
  if (user == '') {
    return `mongodb://${host}/${database}`;
  } else {
    return `mongodb://${user}:${password}@${host}/${database}`;
  }
}

Object.keys(config.db).forEach((key) => {
  if (config.db[key] === undefined) {
    throw new Error(`No config entry found for ${key}`);
  }
});

const MONGO_HOST = `${config.db.url}:${config.db.port}`;
const URL = buildMongoUrl(config.db.user, config.db.password, config.db.name, MONGO_HOST);

function connectMongo() {
  mongoose.connect(URL, err => {
    if (err) logger.error(err);
    else logger.info('Connected to mongo', URL);
  });
}

connectMongo();

/**
 * Code in this File is taken from http://stackoverflow.com/a/33139673
 *
 * Created By: Gil SH (https://stackoverflow.com/users/880223/gil-sh)
 * License is cc by-sa 3.0
 */
var db = mongoose.connection;
let lastReconnectAttempt; //saves the timestamp of the last reconnect attempt

db.on('error', function (error) {
  logger.error('Error in MongoDb connection', error);
  mongoose.disconnect();
});

db.on('disconnected', function () {
  //TODO: Add logging, Before: console.log('MongoDB disconnected!');
  var now = new Date().getTime();

  // check if the last reconnection attempt was too early
  if (lastReconnectAttempt && now - lastReconnectAttempt < 5000) {
    // if it does, delay the next attempt
    var delay = 5000 - (now - lastReconnectAttempt);
    logger.info('reconnecting to MongoDB in ' + delay + 'mills');
    setTimeout(function () {
      logger.info('reconnecting to MongoDB');
      lastReconnectAttempt = new Date().getTime();
      connectMongo();
    }, delay);
  } else {
    logger.info('reconnecting to MongoDB');
    lastReconnectAttempt = now;
    connectMongo();
  }
});

function Lang(key, options) {
  mongoose.SchemaType.call(this, key, options, 'Lang');
}

Lang.prototype = Object.create(mongoose.SchemaType.prototype);

// `cast()` takes a parameter that can be anything. You need to
// validate the provided `val` and throw a `CastError` if you
// can't convert it.
Lang.prototype.cast = val => {

  var possibleLangs = ['en', 'de'];

  var _val = String(val).toLowerCase();

  if (_val === '') {
    throw new mongoose.SchemaType.CastError('Lang', _val + ' is not a String or empty');
  }

  if (possibleLangs.indexOf(_val) === -1) {
    throw new mongoose.SchemaType.CastError('Lang', _val + ' is not a valid language');
  }

  return _val;
};

Lang.prototype.checkRequired = value => !!(value && value.length);

// Don't forget to add `Lang` to the type registry
mongoose.Schema.Types.Lang = Lang;

module.exports = mongoose;
