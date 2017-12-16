/**
 *
 * @constructor
 */
const Logger = function() {
};

/**
 *
 * Error log
 *
 * @param message
 */
Logger.error = console.error;

/**
 *
 * Info log
 *
 * @param message
 */
Logger.info = console.info;

/**
 *
 * Debug log
 *
 * @param message
 */
Logger.debug = console.log;

/**
 *
 * Warning log
 *
 * @param message
 */
Logger.warn = console.warn;

/**
 *
 * @type {Logger}
 */
module.exports = Logger;
