const express = require('express');
const router = express.Router();
const afimport = require("afimport");
const app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
const OauthModel = afimport.require("oauth2.0");

router.all('*', app.oauth.authorise(), function (req, res, next) {
    next();
});

/**
 * GET /logout
 * response none
 */
router.delete('/logout', function (req, res, next) {
    OauthModel.revokeAccessToken(req.oauth.bearerToken.token, function (error) {
        if (error)
            return next(error);
        else
            res.send();
    });
});

module.exports = router;