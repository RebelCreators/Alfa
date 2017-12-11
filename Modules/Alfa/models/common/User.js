var afimport = require("afimport");
var Shared = afimport.require("shared");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

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
        enum : ["none","male", "female"],
        default : 'None'
    },
    extras: Schema.Types.Mixed
});

UserSchema.statics.minimumPasswordLength = 4;

UserSchema.methods.toPublicJSON = function () {
    var json = this.toJSON({minimize : false});
    json.password = null;
    delete json.password;
    return json;
}

UserSchema.statics.fromPublicJSON = function (json) {
    var object = Object.assign({}, json);
    object.password = null;
    delete object.password;

    var mapped = Shared.caseInsensitiveMap(UserSchema.obj, object, true);

    return new UserModel(mapped);
}

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
}

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
}

UserSchema.statics.updateUser = function (json) {
    return new Promise(function (resolve, reject) {
        var _id = mongoose.Types.ObjectId(json._id);
        delete  json._id;
        UserModel.findOneAndUpdate({ _id : _id }, json, { new : true }, function(err, user){
            if (err) return reject(err);
            if (!user) return callback(new Error("Error Updating user"));

            UserModel.populate(user, '-password', function (err, user) {
                if (err) return reject(err);
                resolve(user);
            });
        });
    });
}

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
}

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
}

UserSchema.statics.getUser = function (username, password) {
    var self = this;
    return new Promise(function (resolve, reject) {
        UserModel.findOne({ userName : username }, function (err, obj) {
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
}

UserSchema.statics.getUserById = function (userId) {
    return new Promise(function (resolve, reject) {
        UserModel.findOne({'_id': userId}, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);

            resolve(obj);
        });
    });
}

UserSchema.statics.getUsersByIds = function (userIds) {
    return new Promise(function (resolve, reject) {
        UserModel.find({'_id': { $in: userIds} }, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);

            resolve(obj);
        });
    });
}

UserSchema.statics.getUsersByUserNames = function (userIds) {
    return new Promise(function (resolve, reject) {
        UserModel.find({ userName : { $in: userIds} }, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return resolve(null);

            resolve(obj);
        });
    });
}

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
}

mongoose.model('UserModel', UserSchema);

var UserModel = mongoose.model('UserModel');
module.exports = UserModel;
