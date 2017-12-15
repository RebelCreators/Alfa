const afimport = require("afimport");
const DB = afimport.require("db");
const User = afimport.require("User");
const AccessToken = afimport.require("AccessToken");
const RefreshToken = afimport.require("RefreshToken");

/**
 * @ref oauth2.0
 */

module.exports.getUser = User.getUser$;

module.exports.getClient = function (clientId, clientSecret, callback) {
    if (clientId == process.env.ALFA_CLIENT_ID && clientSecret == process.env.ALFA_CLIENT_SECRET) {

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