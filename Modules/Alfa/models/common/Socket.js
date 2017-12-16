const afimport = require("afimport");
const Shared = afimport.require("shared");
const io = require('socket.io')();
const oauth = afimport.require('AccessToken');
const DeviceModel = afimport.require('Device');
const DialogModel = afimport.require('Dialog');

const logger = afimport.require("logger");

const redisConfig = {host: process.env.ALFA_REDIS_HOST, port: process.env.ALFA_REDIS_PORT};
const redis = require('socket.io-redis');
/**
 * connect socket
 */
const connect = function () {
    io.use(function (socket, next) {
        try {
            var query = socket.handshake.query;
            var bearer = query.bearer;

            oauth.getAccessToken(bearer, function (error, token) {
                if (error) {
                    var error = new Error("401");
                    error.code = 401;
                    next(error);
                    return;
                }
                socket.client.token = token;
                next();
            });
        } catch (e) {
            next(e);
        }
    });

    io.use(function (socket, next) {
        try {
            var query = socket.handshake.query;
            var currentUser = socket.client.token.user;
            var deviceToken = query.deviceToken;
            DeviceModel.deviceWithToken(deviceToken).then(function (device) {
                device.clientId = socket.client.id;
                return device.updateDevice(currentUser).then(function () {
                    next();
                })
            }).catch(function (error) {
                next(error);
            });
        } catch (e) {
            next(e);
        }
    });

    io.use(function (socket, next) {
        try {
            socket.on('disconnect', function () {
                var query = socket.handshake.query;
                var currentUser = socket.client.token.user;
                var deviceToken = query.deviceToken;
                var id = socket.client.id;
                DeviceModel.deviceWithToken(deviceToken).then(function (device) {
                    if (device.user._id != currentUser._id) {
                        return;
                    }
                    device.clientId = null;
                    return device.updateDevice(currentUser).then(function () {

                    });
                });
            });
            next();
        } catch (e) {
            next(e);
        }

    });

    io.on('connection', function (socket) {
        var id = socket.client.id;
        logger.info("socket connected");
    });

    io.listen(process.env.ALFA_SOCKET_PORT);
    var adapter = redis(redisConfig);
    io.adapter(adapter);

    adapter.pubClient.on('error', function(error){
        logger.error("error" + error);

    });
    adapter.subClient.on('error', function(error){
        logger.error("error" + error);
    });
};

/**
 * Sends message to device.
 *
 * @param {object} message
 * @param {DeviceModel} device
 */
const sendMessageToDevice = function (message, device) {
    if (!message || !device) {
        return;
    }
    const clientId = device.clientId;
    if (!clientId) {
        return;
    }
    io.to(clientId).emit("com.rebel.creators.message", message);
};

/**
 * Sends message to dialog
 *
 * @param {object} message
 * @param {DialogModel} dialog
 */
const send = function (message, dialog) {
    DeviceModel.devicesForUsers(dialog.currentUsers).then(function (devices) {
        DeviceModel.iterateDevices(devices, function (key, device) {
            sendMessageToDevice(message, device);
        });
    });
};

module.exports.send = send;
module.exports.connect = connect;