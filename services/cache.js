'use strict';

const co = require('co');
const mongoose = requireLocal('controller/mongo.js');

const CacheObject = mongoose.model('cache', requireLocal('schemas/cacheObject'));


let cache = {};

cache.getObject = (key, callback) => {

  return new Promise((resolve, reject) => {
    CacheObject.findOne({key: key}, function (err, resultCache) {
      if (err) {
        logger.error(err);
        reject(err);
      }
      if (resultCache) {

        //Send object anyways
        try {
          resolve(JSON.parse(resultCache.content));
        } catch (ex) {
          logger.error(ex);
          reject(ex);
        }

        if (resultCache.expiration < Date.now() && !resultCache.updating) {
          resultCache.updating = true;
          resultCache.save((err, doc) => {
            if (err) {
              logger.error(err);
              return reject(err);
            }
            callback().then((resultLive) => {
              cache.updateCache(doc, resultLive);
            }).catch(reject);
          });
        }
      } else {
        callback().then((resultLive) => {
          resolve(resultLive);
          cache.createObject(key, resultLive);
        }).catch(reject);
      }
    });
  });
};

cache.createObject = (key, object) => co(function*() {
  return new Promise((resolve, reject) => {
    CacheObject.create({
      key: key,
      expiration: Date.now() + 30000,
      content: JSON.stringify(object),
      updating: false
    }, (err, doc) => {
      if (err) {
        logger.error(err);
        return reject(err);
      }
      return resolve(doc);
    });
  });
}).catch(ex => {
  throw ex;
});

cache.updateCache = (doc, object) => co(function*() {
  return new Promise((resolve, reject) => {
    doc.expiration = Date.now() + 300000;
    doc.content = JSON.stringify(object);
    doc.updating = false;
    doc.save((err, doc) => {
      if (err) {
        logger.error(err);
        return reject(err);
      }
      return resolve(doc);
    });
  });
}).catch(ex => {
  throw ex;
});


module.exports = cache;