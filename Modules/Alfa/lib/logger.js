const Logger = function() {
};

Logger.error = console.error;
Logger.info = console.info;
Logger.debug = console.log;
Logger.warn = console.warn;

module.exports = Logger;
