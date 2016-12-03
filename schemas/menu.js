'use strict';
var mongoose = require('mongoose');
var menuItem = require('../schemas/menu-item.js');

var menuSchema = new mongoose.Schema({
  language: mongoose.Schema.Types.Lang,
  _items: [menuItem],
});

menuSchema.pre('remove', function (next) {
  this._menuItems.forEach(function (view) {
    menuItem.remove({ _id: view._id }).exec();
  });

  next();
});

module.exports = menuSchema;
