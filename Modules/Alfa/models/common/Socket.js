const afimport = require("afimport");
const Shared = afimport.require("shared");
const io = require('socket.io')();
const oauth = afimport.require('AccessToken');
const DeviceModel = afimport.require('Device');
const DialogModel = afimport.require('Dialog');
const MessageModel = afimport.require('Message');
const apns = afimport.require("APNS");
const logger = afimport.require("logger");
const PushConfig = afimport.require('push_config');

const redisConfig = {host: process.env.ALFA_REDIS_HOST, port: process.env.ALFA_REDIS_PORT};
const redis = require('socket.io-redis');
const DisabledPushConfig = "com.rebel.creators.none";

/**
 * DB Module
 * @module Socket
 */

/**
 * connect socket
 *
 * @memberof module:Socket
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
                    if (device.user._id.toString() != currentUser._id.toString()) {
                        return;
                    }
                    device.clientId = null;
                    return device.updateDevice(currentUser);
                }).catch(function (error) {
                    logger.error("" + error);
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
    if (redisConfig.host) {
        var adapter = redis(redisConfig);
        io.adapter(adapter);

        adapter.pubClient.on('error', function (error) {
            logger.error("" + error);

        });
        adapter.subClient.on('error', function (error) {
            logger.error("" + error);
        });
    }
};


/**
 * @private
 * @type {{DialogNamespace: string, ServerNamespace: string}}
 */
var MessageNamespace = {
    DialogNamespace: "com.rebel.creators.message",
    ServerNamespace: "com.rebel.creators.server.message"
};


/**
 *
 * @private
 */
const sendMessageToDevice = function (message, device, namespace, dialog, sender) {
    if (!message || !device) {
        return;
    }
    const clientId = device.clientId;
    if (!clientId) {
        if (device.apnsToken && (!message.pushConfig || message.pushConfig != DisabledPushConfig)) {
            var pushConfig = PushConfig.configForName(message.pushConfig);
            var apnsNotification = new apns.APNSNotification(message.toJSON(), device);
            apnsNotification.dialog = dialog;
            apnsNotification.sender = sender;
            apnsNotification.pushConfig = pushConfig;
            apnsNotification.namespace = namespace;
            apnsNotification.send().catch(function (error) {
                logger.error("" + error);
            });
            return;
        }
        return;
    }
    io.to(clientId).emit(namespace, message.toJSON());
};


/**
 * Sends message to dialog
 *
 * @memberof module:Socket
 *
 * @param {MessageModel} message
 * @param {DialogModel} dialog
 * @param {UserModel} sender
 */
const send = function (message, dialog, sender) {
    DeviceModel.devicesForUsers(dialog.currentUsers).then(function (devices) {
        DeviceModel.iterateDevices(devices, function (key, device) {
            sendMessageToDevice(message, device, MessageNamespace.DialogNamespace, dialog, sender);
        });
    });
};


/**
 * Sends a server message to a user's devices
 *
 * @memberof module:Socket
 *
 * @param {MessageModel} message
 * @param {UserModel} sender
 */
const sendServerMessageToUser = function (message, sender) {
    DeviceModel.devicesForUsers([sender]).then(function (devices) {
        DeviceModel.iterateDevices(devices, function (key, device) {
            sendMessageToDevice(message, device, MessageNamespace.ServerNamespace, null, sender);
        });
    });
};


/**
 *
 * @type {module:Socket.send}
 */
module.exports.send = send;


/**
 *
 * @type {module:Socket.sendServerMessageToUser}
 */
module.exports.sendServerMessageToUser = sendServerMessageToUser;


/**
 *
 * @type {module:Socket.connect}
 */
module.exports.connect = connect;