var afimport = require("afimport");
var Shared = afimport.require("shared");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

/**
 *
 * @type {UserSchema}
 */
var UserSchema = new Schema({
        firstName: String,
        lastName: String,
        userName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: String,
        gender: {
            type: String,
            enum: ["none", "male", "female"],
            default: 'None'
        },
        extras: Schema.Types.Mixed
    },
    {
        toJSON:
            {
                transform: function (doc, ret) {
                    delete ret.password;
                }
            }
    });

UserSchema.statics.minimumPasswordLength = 4;

//*********************************************************************************
//*************************** JSON Methods

/**
 *
 * @param {Object} json
 * @return {UserModel}
 */
UserSchema.statics.fromPublicJSON = function (json) {
    var object = Object.assign({}, json);
    object.password = null;
    delete object.password;

    var mapped = Shared.caseInsensitiveMap(UserSchema.obj, object, true);

    return new UserModel(mapped);
};

//*********************************************************************************
//*************************** Public Methods

/**
 *
 * @return {Promise}
 */
UserSchema.methods.validateUser = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        var message = null;

        if (!self.userName) {
            message = "Username not provided";
        } else if (!self.password || self.password.length < UserModel.minimumPasswordLength) {
            message = "password not provided";
        }

        if (message) {
            return reject(new Error(message));
        }

        resolve();
    });
};

/**
 *
 * @return {Promise.<UserModel, Error>}
 */
UserSchema.methods.saveNewUser = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.save(function (err) {
            if (err) return reject(err);
            UserModel.populate(self, '-password', function (err, user) {
                if (err) return reject(err);
                resolve(user);
            });
        });
    });
};

//*********************************************************************************
//*************************** Static Methods

/**
 *
 * @param {string} username
 * @param {string} password
 * @return {Promise.<UserModel, Error>}
 */
UserSchema.statics.getUser = function (username, password) {
    var self = this;
    return new Promise(function (resolve, reject) {
        UserModel.findOne({userName: username}, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);
            bcrypt.compare(password, obj.password, function (err, res) {
                if (err) return reject(err);
                if (!res) return resolve(null);

                UserModel.populate(obj, '-password', function (err, user) {
                    if (err) return reject(err);
                    resolve(user);
                });
            });
        });
    });
};

/**
 *
 * @param {string} username
 * @param {string} password
 * @param {function:(Error, UserModel)} callback
 */
UserSchema.statics.getUser$ = function (username, password, callback) {
    UserModel.getUser(username, password).then(function (user) {
        if (!user) {
            var error = new Error("Invalid User");
            error.status = 401;
            return callback(error, null);
        }

        callback(null, user);
    }).catch(function (err) {
        callback(err, null);
    })
};

/**
 *
 * @param password
 * @return {Promise.<string, Error>}
 */
UserSchema.statics.hashPassword = function (password) {
    return new Promise(function (resolve, reject) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return reject(err);
            bcrypt.hash(password, salt, null, function (err, hash) {
                if (err) return reject(err);
                resolve(hash);
            });
        });
    });
};

/**
 *
 * @param {string} userId
 * @return {Promise.<UserModel, Error>}
 */
UserSchema.statics.getUserById = function (userId) {
    return new Promise(function (resolve, reject) {
        UserModel.findOne({'_id': userId}, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);

            resolve(obj);
        });
    });
};

/**
 *
 * @param {Array.<string>} userIds
 * @return {Promise.<Array.<UserModel>, Error>}
 */
UserSchema.statics.getUsersByIds = function (userIds) {
    return new Promise(function (resolve, reject) {
        UserModel.find({'_id': {$in: userIds}}, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);

            resolve(obj);
        });
    });
};

/**
 *
 * @param {string} userName
 * @return {Promise.<UserModel, Error>}
 */
UserSchema.statics.getUserByUserName = function (userName) {
    return new Promise(function (resolve, reject) {
        var q = {userName: userName.toLowerCase()};
        UserModel.findOne(q, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);
            UserModel.populate(obj, '-password', function (err, user) {
                if (err) return reject(err);
                resolve(user);
            });
        });
    });
};

/**
 *
 * @param {Array.<string>} userNames
 * @return {Promise.<Array.<UserModel>, Error>}
 */
UserSchema.statics.getUsersByUserNames = function (userNames) {
    return new Promise(function (resolve, reject) {
        UserModel.find({userName: {$in: userNames}}, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);

            resolve(obj);
        });
    });
};

/**
 *
 * @param {Object} json
 * @return {Promise.<UserModel, Error>}
 */
UserSchema.statics.updateUser = function (json) {
    return new Promise(function (resolve, reject) {
        var _id = mongoose.Types.ObjectId(json._id);
        delete  json._id;
        UserModel.findOneAndUpdate({_id: _id}, json, {new: true}, function (err, user) {
            if (err) return reject(err);
            if (!user) return callback(new Error("Error Updating user"));

            UserModel.populate(user, '-password', function (err, user) {
                if (err) return reject(err);
                resolve(user);
            });
        });
    });
};

mongoose.model('UserModel', UserSchema);

/**
 * @constructor
 */
var UserModel = mongoose.model('UserModel');
module.exports = UserModel;
