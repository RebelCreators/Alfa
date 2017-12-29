/**
 *
 * @type {{alert: string, badge: number, sound: null}}
 */
const defaultConfig = {
    "alert": {
        "title" : "New message",
        "body" : "{{sender.userName}} sent a message"
    },
    "badge": 0,
    "sound": null
}

const configs = {};

/**
 * Push Configuration
 * @module push_config
 */

/**
 *
 * @function configForName
 * @memberof module:push_config
 *
 * @param {string} configName
 * @return {{alert: string, badge: ?number, sound: ?string}}
 */
module.exports.configForName = function (configName) {
    const config = configs[configName];
    return config || defaultConfig;
};

/**
 * @function setConfigForName
 * @memberof module:push_config
 *
 * @param {string} configName
 * @param {{alert: string, badge: ?number, sound: ?string}} config
 */
module.exports.setConfigForName = function (configName, config) {
    configs[configName] = config;
};

/**
 * @function setDefaultConfig
 * @memberof module:push_config
 *
 * @param {?{alert: string, badge: ?number, sound: ?string}} config
 */
module.exports.setDefaultConfig = function (config) {
    module.exports.defaultConfig = config || defaultConfig;
};

module.exports.defaultConfig = defaultConfig;
