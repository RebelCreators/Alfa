const afimport = require("afimport");
const os = require('os');
const PushConfig = afimport.require('push_config');
const Mustache = require("mustache");
const apn = require('apn');
const path = require("path");
const Environment = afimport.require("Environment");
const RCMessageKey = "com.rebel.creators.message.key";

/**
 * Push Service
 * @module APNS
 */

/**
 * @private
 */
var options = {
    token: {
        key: path.resolve(os.homedir()) + path.sep + ".certs/apns.p8",
        keyId: Environment["APNS_KEY_ID"],
        teamId: Environment["APNS_TEAM_ID"]
    },
    production: false
};


/**
 * @private
 */
var Provider = new apn.Provider(options);


/**
 *
 * @param {string} messageObject
 * @param {string} device
 * @param {string=} dialog
 * @param {string=} sender
 * @param {string=} pushConfig
 * @param {string=} namespace
 *
 * @constructor APNSNotification
 */
const APNSNotification = function (messageObject, device, dialog, sender, pushConfig, namespace) {
    this.messageObject = messageObject;
    this.dialog = dialog;
    this.device = device;
    this.fromUser = sender;
    this.pushConfig = pushConfig;
    this.namespace = namespace
};


/**
 * @type {Object}
 */
APNSNotification.prototype.messageObject;

/**
 * @type {DeviceModel}
 */
APNSNotification.prototype.device;

/**
 * @type {?DialogModel}
 */
APNSNotification.prototype.dialog;

/**
 *
 * The user that sent the message
 *
 * @type {?UserModel}
 */
APNSNotification.prototype.sender;

/**
 * Config object for push notification See: push_config
 * @type {?Object}
 */
APNSNotification.prototype.pushConfig;

/**
 *
 * The socket io namespace for the notification
 * @type {?string}
 */
APNSNotification.prototype.namespace;

/**
 *
 * Sends a push notification
 *
 * @return {Promise}
 */
APNSNotification.prototype.send = function () {
    const self = this;
    const apnsToken = self.device.apnsToken;
    if (!apnsToken) {
        return new Promise(function (resolve, reject) {
            reject(new Error("Notification credential not found."));
        });
    }
    const pushConfig = self.pushConfig || {};
    const dialog = self.dialog;
    const messageObject = self.messageObject;
    const sender = self.sender;
    const templateInput = {
        "message": messageObject,
        "dialog": dialog ? dialog.toJSON() : null,
        "to": self.device.user,
        "sender": sender
    };
    const alertTemplate = pushConfig.alert || PushConfig.defaultConfig.alert;
    const alert = JSON.parse(Mustache.render(JSON.stringify(alertTemplate), templateInput));

    const notification = new apn.Notification();
    notification.alert = alert;
    notification.payload = {namespace: self.namespace};
    notification.payload[RCMessageKey] = messageObject || {};
    notification.sound = pushConfig.sound || PushConfig.defaultConfig.sound;
    notification.badge = pushConfig.badge || PushConfig.defaultConfig.badge;
    notification.topic = Environment["PUSH_APP_BUNDLE"];

    return Provider.send(notification, apnsToken);
};

module.exports.APNSNotification = APNSNotification;
