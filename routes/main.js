/**
 * Router for /
 */
'use strict';

var mongoose = require('../controller/mongo.js');
var proxy = require('../controller/templateProxy.js');

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    res.send("DONE");
});

module.exports = router;