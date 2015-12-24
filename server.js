'use strict';
var express = require('express');
var request = require('request');
var handlebars = require('handlebars');
var mongoose = require('./controller/mongo.js');
mongoose.con();

var app = express();

//app.use(express.static(__dirname + '/public/'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

//MONGOTEST


app.get('/', function (req, res) {
  var templateSchema = require('./schemas/template.js');

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

//MONGOTESTEND