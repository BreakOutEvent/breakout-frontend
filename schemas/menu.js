'use strict';
var mongoose = require('mongoose');
var MenuItemSchema = require('./MenuItem.js');

var menuSchema = new mongoose.Schema({
  title: String,
  _menuItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'menuItem'
  }]
});

menuSchema.pre('remove', function(next) {
  this._menuItems.forEach(function(view) {
    MenuItemSchema.remove({_id: view._id}).exec();
  });
  next();
});

module.exports = menuSchema;