const afimport = require("afimport");
const router = afimport.require("ExpressRouter", {
    namespace: "com.rebelcreators.Router"
})();
const app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
const OauthModel = afimport.require("oauth2.0");
const logger = afimport.require("logger");

router.all('*', app.oauth.authorise(), function (req, res, next) {
    next();
});

/**
 * GET /logout
 * response none
 */
router.delete('/logout', function (req, res, next) {
    try {
        OauthModel.revokeAccessToken(req.oauth.bearerToken.token, function (error) {
            if (error)
                return next(error);
            else
                res.send();
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

module.exports = router;