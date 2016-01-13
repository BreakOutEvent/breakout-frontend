/**
 * Router for /admin
 */

'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('admin/home',
        {
            layout: 'admin',
            path: '/admin'
        }
    );
});

router.get('/about', function (req, res, next) {
    res.render('admin/about',
        {
            layout: 'admin',
            path: '/admin'
        }
    );
});

router.get('/contact', function (req, res, next) {
    res.render('admin/contact',
        {
            layout: 'admin',
            path: '/admin'
        }
    );
});

module.exports = router;