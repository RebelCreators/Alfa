var afimport = require("afimport");
var Shared = afimport.require("shared");
var io = require('socket.io')();
var oauth = afimport.require('AccessToken');
var DeviceModel = afimport.require('Device');
var DialogModel = afimport.require('Dialog');

var clients = {};

/**
 * connect socket
 */
var connect = function () {
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
                delete clients[id];
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
        clients[id] = socket;
    });

    io.listen(5225);
};

/**
 * Sends message to device.
 *
 * @param {object} message
 * @param {DeviceModel} device
 */
var sendMessageToDevice = function (message, device) {
    var clientId = device.clientId;
    if (clientId) {
        if (clients[clientId]) {
            clients[clientId].emit('com.rebel.creators.message', message);
        }
    }
};

/**
 * Sends message to dialog
 *
 * @param {object} message
 * @param {DialogModel} dialog
 */
var send = function (message, dialog) {
    DeviceModel.devicesForUsers(dialog.currentUsers).then(function (devices) {
        DeviceModel.iterateDevices(devices, function (key, device) {
            sendMessageToDevice(message, device);
        });
    })
};

module.exports.send = send;
module.exports.connect = connect;