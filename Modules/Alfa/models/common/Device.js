var afimport = require("afimport");
var Shared = afimport.require("shared");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * The data-layer
 * @module models/DeviceModel
 */

/**
 *
 * @constructor DeviceModel
 */
var DeviceSchema = new Schema({
        /**
         * @memberof module:models/DeviceModel~DeviceModel
         * @instance
         *
         * @type {UserModel}
         */
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true},
        /**
         * @memberof module:models/DeviceModel~DeviceModel
         * @instance
         *
         * @type {string}
         */
        deviceToken: {type: String, unique: true, required: true},
        /**
         * @memberof module:models/DeviceModel~DeviceModel
         * @instance
         *
         * @type {string}
         */
        apnsToken: String,
        /**
         * @memberof module:models/DeviceModel~DeviceModel
         * @instance
         *
         * @default Date.now
         *
         * @type {Date}
         */
        date: {type: Date, default: Date.now, required: true},
        /**
         * @memberof module:models/DeviceModel~DeviceModel
         * @instance
         *
         * @type {string}
         */
        clientId: {type: String}
    },
    {
        toJSON:
            {
                transform: function (doc, ret) {
                    delete  ret._id;
                    delete ret.user;
                    delete ret.date;
                    delete ret.clientId;
                }
            }
    });

//*********************************************************************************
//*************************** JSON Methods

/**
 *
 * @function fromPublicJSON
 * @memberof module:models/DeviceModel~DeviceModel
 *
 * @param {object} json
 * @return {DeviceModel}
 */
DeviceSchema.statics.fromPublicJSON = function (json) {
    delete  json._id;
    delete json.user;
    delete json.date;
    delete json.clientId;
    var mapped = Shared.caseInsensitiveMap(DeviceSchema.obj, json)

    return new DeviceModel(mapped);
};

//*********************************************************************************
//*************************** Public Methods

/**
 *
 * @function devicesForUser
 * @memberof module:models/DeviceModel~DeviceModel
 * @instance
 *
 * @param {UserModel} user
 * @return {Promise.<Array.<DeviceModel>, Error>}
 */
DeviceSchema.methods.devicesForUser = function (user) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {user: user};
        DeviceModel.find(query).populate("user").exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
};

/**
 *
 * @function updateDevice
 * @memberof module:models/DeviceModel~DeviceModel
 * @instance
 *
 * @param {UserModel} user
 * @return {Promise.<DeviceModel, Error>}
 */
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
};

//*********************************************************************************
//*************************** Static Methods

/**
 *
 * @function devicesForUsers
 * @memberof module:models/DeviceModel~DeviceModel
 *
 * @param {Array.<UserModel>} user
 * @return {Promise.<Array.<DeviceModel>, Error>}
 */
DeviceSchema.statics.devicesForUsers = function (users) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {user: {$in: users}};
        DeviceModel.find(query).populate("user").exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
};

/**
 *
 * @function iterateDevices
 * @memberof module:models/DeviceModel~DeviceModel
 *
 * @param {Array.<DeviceModel>} devices
 * @param {Function} iterate
 */
DeviceSchema.statics.iterateDevices = function (devices, iterate) {
    var count = devices.length;
    Shared.asyncForEach(devices, iterate);
};

/**
 *
 * @function removeDevice
 * @memberof module:models/DeviceModel~DeviceModel
 *
 * @param {UserModel} currentUser
 * @param {string} deviceToken
 * @return {Promise}
 */
DeviceSchema.statics.removeDevice = function (currentUser, deviceToken) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {deviceToken: deviceToken, user: currentUser._id};
        DeviceModel.remove(query, function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
};

/**
 *
 * @function deviceWithToken
 * @memberof module:models/DeviceModel~DeviceModel
 *
 * @param {string} deviceToken
 * @return {Promise.<DeviceModel, Error>}
 */
DeviceSchema.statics.deviceWithToken = function (deviceToken) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {deviceToken: deviceToken};
        DeviceModel.findOne(query).populate("user").exec(function (err, obj) {
            if (err) return reject(err);
            resolve(obj);
        });
    });
};

mongoose.model('DeviceModel', DeviceSchema);

var DeviceModel = mongoose.model('DeviceModel');
module.exports = DeviceModel;