/**
 * Router for /
 */
'use strict';

var mongoose = require('../controller/mongo.js');
var proxy = require('../controller/templateProxy.js');

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    var templateSchema = require('../schemas/template.js');

    var Template = mongoose.model('template', templateSchema);
    /*
     Template.create({
     title: "Index",
     vars: [{
     title: "Headline",
     description: "Enter the Headline here.",
     contentType: mongoose.constants.TEXT,
     contentMaxLength: 20
     }]
     }, function(err, templ) {
     if(err) {
     console.log(err);
     } else {
     console.log(templ);
     }
     });
     */

    Template.find({'title': 'Index'}).exec(function (err, templates) {
        if (err) {
            console.log(err);
        } else {
            console.log(templates);
        }
    });


    res.send("DONE");

});

module.exports = router;