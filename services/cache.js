'use strict';

const co = require('co');
const mongoose = requireLocal('controller/mongo.js');

const CacheObject = mongoose.model('cache', requireLocal('schemas/cacheObject'));


let cache = {};

let cacheCallbackQueue = {};

cache.getObject = (key, callback) =>
  new Promise((resolve, reject) => {
    CacheObject.findOne({ key: key }, function (err, resultCache) {
      if (err) {
        logger.error(err);
        return reject(err);
      }

      if (resultCache) { // Key is cached
        //Send object anyways
        try {
          resolve(JSON.parse(resultCache.content));
        } catch (ex) {
          logger.error(resultCache, ex);
          reject(ex);
        }

        if (resultCache.expiration < Date.now() && !resultCache.updating) {
          resultCache.updating = true;
          resultCache.save().then(doc => {
            if (err) {
              logger.error(resultCache, err);
              return;
            }
            return callback().then((resultLive) => {
              return cache.updateCache(doc, resultLive);
            });
          }).catch(ex => {
            reject(ex);
            resultCache.updating = false;
            resultCache.save();
          });
        }
      } else { // Key is not cached
        if (key in cacheCallbackQueue) {
          // Add resolve and reject to array
          cacheCallbackQueue[key].push([resolve, reject])
        } else {
          // Create array of callbacks empty
          cacheCallbackQueue[key] = [];

          callback().then((resultLive) => {
            return cache.createObject(key, resultLive).then(() => {
              // Notify all queued requests
              cacheCallbackQueue[key].forEach(e => e[0](resultLive));

              // Resolve the caller
              resolve(resultLive);

              // Delete the queued requests
              delete cacheCallbackQueue[key];
            });
          }).catch(ex => {
            // Notify and delete all queued things
            cacheCallbackQueue[key].forEach(e => e[1](ex));
            delete cacheCallbackQueue[key];
            reject(ex);
          });
        }
      }
    });
  });

cache.createObject = (key, object) =>
  new Promise((resolve, reject) => {
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

cache.updateCache = (doc, object) =>
  new Promise((resolve, reject) => {
    doc.expiration = Date.now() + 30000;
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


module.exports = cache;