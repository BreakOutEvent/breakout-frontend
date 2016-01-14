'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    salt: {type: String},
    emails: [{type: String, required: true}],
    displayName: {type: String}
});

UserSchema.pre('save', function (next) {
    var currentUser = this;

    // if the password has no changes, there is no need to recalculate the hash
    if (!currentUser.isModified('password'))
        return next();

    // 10 = brypt salt work factor
    // generate a new salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            console.log(err);
            return next();
        }

        // hash the new password with the new salt
        bcrypt.hash(currentUser.password, salt, function (err, hash) {
            if (err) {
                console.log(err);
                return next();
            }

            // save the new password hash and salt
            currentUser.password = hash;
            currentUser.salt = salt;
            next();
        });
    });
});

UserSchema.methods.validatePassword = function (password) {
    var currentUser = this;

    return new Promise(function (resolve, reject) {
        bcrypt.compare(password, currentUser.password, function (err, match) {
            if (err)
                throw err;

            if (match)
                resolve();
            else
                reject();
        });
    });
};

UserSchema.statics.findById = function (id) {
    var userSchema = this;

    return new Promise(function (resolve, reject) {
        userSchema.findOne({'_id': id}, function (err, user) {
            if (err)
                throw err;

            if (user)
                resolve(user);
            else
                reject(new Error('User ' + id + ' does not exist'));
        });
    });
};

UserSchema.statics.findByUsername = function (username) {
    var userSchema = this;

    return new Promise(function (resolve, reject) {
        userSchema.findOne({'username': username}, function (err, user) {
            if (err)
                throw err;

            if (user)
                resolve(user);
            else
                reject();
        });
    });
};

module.exports = UserSchema;