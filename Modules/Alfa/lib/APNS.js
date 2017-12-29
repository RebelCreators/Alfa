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
 * @module push-service
 */

var options = {
    token: {
        key: path.resolve(os.homedir()) + path.sep + ".certs/apns.p8",
        keyId: "64QWKA8JJ8",
        teamId: "UXAB3BW444"
    },
    production: false
};

/**
 * @memberof module:push-service
 * @type {Notification}
 */
module.exports.Notification = apn.Notification;

/**
 * @memberof module:push-service
 * @type {Provider}
 */
module.exports.Provider = new apn.Provider(options);


/**
 *
 * @function MakeNotification
 * @memberof module:push-service
 *
 * @param {MessageModel} message
 * @param {DialogModel} dialog
 * @param {string} apnsToken
 * @param {DeviceModel} device
 * @return {Promise}
 * @constructor
 */
module.exports.sendNotification = function (message, dialog, apnsToken, device, fromUser) {
    const self = this;
    const messageObject = message.toJSON();
    const pushConfig = PushConfig.configForName(message.pushConfig);
    const templateInput = {
        "message": messageObject,
        "dialog": dialog ? dialog.toJSON() : null,
        "to": device.user,
        "from": fromUser
    };
    const alert = Mustache.render(pushConfig.alert || PushConfig.defaultConfig.alert, templateInput);

    const notification = new self.Notification();
    notification.alert = alert;
    notification.payload = {RCMessageKey: messageObject || {}};
    notification.sound = pushConfig.sound || PushConfig.defaultConfig.sound;
    notification.badge = pushConfig.badge || PushConfig.defaultConfig.badge;
    notification.topic = Environment["PUSH_APP_BUNDLE"];
    return self.Provider.send(notification, apnsToken);
};
