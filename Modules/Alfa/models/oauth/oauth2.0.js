const afimport = require("afimport");
const DB = afimport.require("db");
const User = afimport.require("User");
const AccessToken = afimport.require("AccessToken");
const RefreshToken = afimport.require("RefreshToken");


/**
 * @private
 */
module.exports.getUser = User.getUser$;

/**
 * @private
 */
module.exports.getClient = function (clientId, clientSecret, callback) {
    if (clientId == process.env.ALFA_CLIENT_ID && clientSecret == process.env.ALFA_CLIENT_SECRET) {

        return callback(null, {clientId: clientId});
    }
    var error = new Error("Unauthorized");
    error.status = 401;
    callback(error, null);
};

/**
 * @private
 */
module.exports.grantTypeAllowed = function (clientId, grantType, callback) {
    if (grantType.toLowerCase() == "password" || grantType.toLowerCase() == "refresh_token") {
        return callback(null, true);
    }

    callback(null, false);
};

/**
 * @private
 */
module.exports.saveRefreshToken = RefreshToken.saveRefreshToken;

/**
 * @private
 */
module.exports.revokeRefreshToken = RefreshToken.revokeRefreshToken;

/**
 * @private
 */
module.exports.getRefreshToken = RefreshToken.getRefreshToken;

/**
 * @private
 */
module.exports.revokeAccessToken = AccessToken.revokeAccessToken;

/**
 * @private
 */
module.exports.saveAccessToken = AccessToken.saveAccessToken;

/**
 * @private
 */
module.exports.getAccessToken = AccessToken.getAccessToken;