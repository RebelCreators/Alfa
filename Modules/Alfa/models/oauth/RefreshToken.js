const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const afimport = require("afimport");
const logger = afimport.require("logger");


/**
 * @ref oauth2.0
 */

/**
 *
 * @type {RefreshTokenSchema}
 */
const RefreshTokenSchema = new Schema({
    token: String,
    clientId: String,
    expires: Date,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'}
});

/**
 *
 * @param refreshToken
 * @param clientId
 * @param expires
 * @param user
 * @param callback
 */
RefreshTokenSchema.statics.saveRefreshToken = function (refreshToken, clientId, expires, user, callback) {
    var token = {token: refreshToken, clientId: clientId, expires: expires, user: user._id}
    RefreshTokenModel.findOneAndUpdate({token: refreshToken}, token, {upsert: true, new: true}, function (err, token) {
        if (err) return callback(err);
        if (!token) return callback(new Error("Error Saving Token"));

        logger.info("Updated the refreshToken " + token.token);
        callback(null);
    });
};

/**
 *
 * @param refreshToken
 * @param callback
 */
RefreshTokenSchema.statics.revokeRefreshToken = function (refreshToken, callback) {
    var token = {token: refreshToken};
    RefreshTokenModel.remove(token, function (err) {
        if (err) return callback(err);

        callback(null);
    });
};

/**
 *
 * @param refreshToken
 * @param callback
 */
RefreshTokenSchema.statics.getRefreshToken = function (refreshToken, callback) {
    RefreshTokenModel.findOne({'token': refreshToken}).populate('user').exec(function (err, refreshToken) {
        if (err) return callback(err, null);
        callback(null, refreshToken);
    });
};

mongoose.model('RefreshToken', RefreshTokenSchema);

/**
 * @constructor
 */
const RefreshTokenModel = mongoose.model('RefreshToken');
module.exports = RefreshTokenModel;