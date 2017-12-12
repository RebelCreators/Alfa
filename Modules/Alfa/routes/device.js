var express = require('express');
var router = express.Router();
var afimport = require("afimport");
var app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
var DeviceModel = afimport.require("Device");

/**
 * PUT /update
 * body: DeviceModel
 * response none
 */
router.put('/update', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var device = req.body;
    var deviceModel = DeviceModel.fromPublicJSON(device);
    deviceModel.updateDevice(currentUser).then(function () {
        res.send();
    }).catch(function (error) {
        next(error);
    });
});

/**
 * POST /delete
 * body: DeviceModel
 * response none
 */
router.post('/delete', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var device = req.body;
    DeviceModel.removeDevice(currentUser, device.deviceToken).then(function () {
        res.send();
    }).catch(function (error) {
        next(error);
    });
});

module.exports = router;