const afimport = require("afimport");
const router = afimport.require("ExpressRouter", {
    namespace: "com.rebelcreators.Router"
});
const app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
const DeviceModel = afimport.require("Device");

/**
 * PUT /update
 * body: DeviceModel
 * response none
 */
router.put('/update', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const device = req.body;
    const deviceModel = DeviceModel.fromPublicJSON(device);
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
    const currentUser = req.oauth.bearerToken.user;
    const device = req.body;
    DeviceModel.removeDevice(currentUser, device.deviceToken).then(function () {
        res.send();
    }).catch(function (error) {
        next(error);
    });
});

module.exports = router;