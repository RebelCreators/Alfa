var afimport = require("afimport");
var Shared = afimport.require("shared");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true},
    deviceToken: {type: String, unique: true, required: true},
    apnsToken: String,
    date: {type: Date, default: Date.now, required: true},
    clientId: {type: String}
});

DeviceSchema.methods.toPublicJSON = function () {
    var json = this.toJSON();
    delete  json._id;
    delete json.user;
    delete json.date;
    delete json.clientId;

    return json;
}

DeviceSchema.statics.fromPublicJSON = function (json) {
    delete  json._id;
    delete json.user;
    delete json.date;
    delete json.clientId;
    var mapped = Shared.caseInsensitiveMap(DeviceSchema.obj, json)

    return new DeviceModel(mapped);
}

DeviceSchema.methods.updateDevice = function (currentUser) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {deviceToken: self.deviceToken};
        var update = {
            user: currentUser,
            deviceToken: self.deviceToken,
            apnsToken: self.apnsToken,
            clientId: self.clientId,
            $setOnInsert: {
                date: new Date()
            }
        };
        DeviceModel.findOneAndUpdate(query, update, {upsert: true, new: true}, function (err, obj) {
            if (err) return reject(err);
            resolve();
        });
    });
}

DeviceSchema.methods.devicesForUser = function (user) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {user: user};
        DeviceModel.find(query).populate("user").exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
}

DeviceSchema.statics.devicesForUsers = function (users) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {user: {$in: users}};
        DeviceModel.find(query).populate("user").exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
}

DeviceSchema.statics.iterateDevices = function (devices, iterate) {
    var count = devices.length;
    Shared.asyncForEach(devices, iterate);
}

DeviceSchema.statics.removeDevice = function (currentUser, deviceToken) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {deviceToken: deviceToken, user: currentUser._id};
        DeviceModel.remove(query, function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

DeviceSchema.statics.deviceWithToken = function (deviceToken) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {deviceToken: deviceToken};
        DeviceModel.findOne(query).populate("user").exec(function (err, obj) {
            if (err) return reject(err);
            resolve(obj);
        });
    });
}

mongoose.model('DeviceModel', DeviceSchema);

var DeviceModel = mongoose.model('DeviceModel');
module.exports = DeviceModel;