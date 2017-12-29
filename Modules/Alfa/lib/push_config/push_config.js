var defaultConfig = require("./default.json");

var configs = {};

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
    var config = configs[configName];
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

module.exports.defaultConfig = defaultConfig;