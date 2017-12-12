var afimport = require("afimport");
var DB = afimport.require("db");
var Config = afimport.require("config");
var User = afimport.require("User");
var AccessToken = afimport.require("AccessToken");
var RefreshToken = afimport.require("RefreshToken");

/**
 * @ref oauth2.0
 */

module.exports.getUser = User.getUser$;

module.exports.getClient = function (clientId, clientSecret, callback) {
    if (clientId == Config.client_id && clientSecret == Config.client_secret) {

        return callback(null, {clientId: clientId});
    }
    var error = new Error("Unauthorized");
    error.status = 401;
    callback(error, null);
};

module.exports.grantTypeAllowed = function (clientId, grantType, callback) {
    if (grantType.toLowerCase() == "password" || grantType.toLowerCase() == "refresh_token") {
        return callback(null, true);
    }

    callback(null, false);
};

module.exports.saveRefreshToken = RefreshToken.saveRefreshToken;
module.exports.revokeRefreshToken = RefreshToken.revokeRefreshToken;
module.exports.getRefreshToken = RefreshToken.getRefreshToken;

module.exports.revokeAccessToken = AccessToken.revokeAccessToken;

module.exports.saveAccessToken = AccessToken.saveAccessToken;

module.exports.getAccessToken = AccessToken.getAccessToken;