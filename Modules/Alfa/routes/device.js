const afimport = require("afimport");
const router = afimport.require("ExpressRouter", {
    namespace: "com.rebelcreators.Router"
})();
const app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
const DeviceModel = afimport.require("Device");
const logger = afimport.require("logger");
const Socket = afimport.require("Socket");
const MessageModel = afimport.require("Message");


/**
 * PUT /update
 * body: DeviceModel
 * response none
 */
router.put('/update', app.oauth.authorise(), function (req, res, next) {
    try {
        const currentUser = req.oauth.bearerToken.user;
        const device = req.body;
        const deviceModel = DeviceModel.fromPublicJSON(device);
        deviceModel.updateDevice(currentUser).then(function () {
            res.send();
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});


/**
 * POST /delete
 * body: DeviceModel
 * response none
 */
router.post('/delete', app.oauth.authorise(), function (req, res, next) {
    try {
        const currentUser = req.oauth.bearerToken.user;
        const device = req.body;
        DeviceModel.removeDevice(currentUser, device.deviceToken).then(function () {
            res.send();
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

/**
 * POST /ping
 * body: {MessageModel}
 * response none
 */
router.post('/ping', app.oauth.authorise(), function (req, res, next) {
    try {
        const json = Object.assign({}, req.body);
        const currentUser = req.oauth.bearerToken.user;
        const message = MessageModel.fromPublicJSON(json);
        Socket.sendServerMessageToUser(message.toJSON(), currentUser);
        res.send();
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});


module.exports = router;