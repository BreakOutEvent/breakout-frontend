'use strict';
var mongoose = require('mongoose');

var posting = new mongoose.Schema({
  data: {
    id: Number,
    text: String,
    date: Number,
    postingLocation:
    { latitude: Number,
      longitude: Number,
      date: Number,
      id: Number,
      distance: Number,
      team: String,
      teamId: Number,
      event: String,
      eventId: Number,
      locationData: {},
      duringEvent: Boolean },
    media: [{}],
    user:
    { firstname: String,
      lastname: String,
      gender: String,
      id: Number,
      participant: {},
      profilePic: {},
      roles: [String],
      blocked: Boolean },
    comments: [],
    likes: [Number],
    hashtags: [],
    proves: null
  },
  expiration: Number,
  updating: Boolean
});

module.exports = posting;
