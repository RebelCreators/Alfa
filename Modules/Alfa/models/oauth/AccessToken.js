const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const afimport = require("afimport");
const logger = afimport.require("logger");

/**
 * The auth-layer
 * @module models/AccessToken
 */

/**
 *
 * @constructor AccessTokenModel
 */
const AccessTokenSchema = new Schema({
    token : String,
    clientId : String,
    expires : Date,
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'}
});


//*********************************************************************************
//*************************** Static Methods


/**
 *
 * @memberof module:models/AccessToken
 *
 * @param accessToken
 * @param callback
 */
AccessTokenSchema.statics.revokeAccessToken = function (accessToken, callback) {
    var token = {token: accessToken}
    AccessTokenModel.remove(token, function (err) {
        if (err) return callback(err);

        callback(null);
    });
};

/**
 * @memberof module:models/AccessToken
 *
 * @param accessToken
 * @param clientId
 * @param expires
 * @param user
 * @param callback
 */
AccessTokenSchema.statics.saveAccessToken = function(accessToken, clientId, expires, user, callback) {
    var token = {token: accessToken, clientId: clientId, expires: expires, user: user._id}
    AccessTokenModel.findOneAndUpdate({token: accessToken}, token, {upsert:true, new: true}, function(err, token){
        if (err) return callback(err);
        if (!token) return callback(new Error("Error Saving Token"));

        logger.info("Updated the accessToken " + token.token);
        callback(null);
    });
};

/**
 *
 * @memberof module:models/AccessToken
 *
 * @param bearerToken
 * @param callback
 */
AccessTokenSchema.statics.getAccessToken = function(bearerToken, callback) {
     AccessTokenModel.findOne({'token': bearerToken}).populate('user').exec(function (err, accessToken) {
        if (err) return callback(err, null);
        callback(null, accessToken);
    });
};

mongoose.model('AccessToken', AccessTokenSchema);

const AccessTokenModel = mongoose.model('AccessToken');
module.exports = AccessTokenModel;