var afimport = require("afimport");
var Shared = afimport.require("shared");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
    loc: {
        type: [Number]
    },
    userID: {type: String, index: true},
    userType: String
});

LocationSchema.index({loc : '2dsphere'});

LocationSchema.statics.fromPublicJSON = function (json) {
    json.loc = [json.lng, json.lat];

    var mapped = Shared.caseInsensitiveMap(LocationSchema.obj, json)

    return new LocationModel(mapped);
};

LocationSchema.statics.distanceFromCoordinates = function (lon1, lat1, lon2, lat2) {
    var rlat1 = Math.PI * lat1 / 180
    var rlat2 = Math.PI * lat2 / 180
    var dist = Math.sin(rlat1) * Math.sin(rlat2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.cos(Math.PI * (lon1 - lon2) / 180);
    dist = Math.acos(dist)  * 180 / Math.PI * 60 * 1.1515 * 1.609344
    return dist
};

LocationSchema.methods.updateLocation = function (currentUser) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var json = self.toJSON();
        delete json._id;
        LocationModel.findOneAndUpdate({userID: currentUser._id}, json, {new: true, upsert: true}, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return reject(new Error("Error Saving"));

            resolve(obj);
        });
    });
};

LocationSchema.statics.userLocation = function (userId) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {userID: {$in: [userId]}};
        LocationModel.findOne(query, function (err, obj) {
            if (err) return reject(err);
            resolve(obj);
        });
    });
};

LocationSchema.statics.usersLocationsNearMe = function (query, km, limit, offset, currentUser) {

    return LocationModel.userLocation(currentUser._id).then(function (location) {
        return new Promise(function (resolve, reject) {
            if (!query) {
                query = {};
            }
            query.userID = {
                $ne: currentUser._id.toString()
            };

            query.loc = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: location.loc
                    },
                    $maxDistance: km * 1000
                }
            };

            LocationModel.find(query).limit(limit).skip(offset).exec(function (err, objs) {
                if (err) return reject(err);
                resolve(objs);
            });
        });
    });
};

mongoose.model('LocationModel', LocationSchema);
var LocationModel = mongoose.model('LocationModel');
module.exports = LocationModel;