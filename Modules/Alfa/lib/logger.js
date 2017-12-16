const Logger = function(name) {
    return require('debug')(name);
};

Logger.error = Logger("Alfa:ERROR");
Logger.info = Logger("Alfa:INFO");
Logger.debug = Logger("Alfa:DEBUG");
Logger.warn = Logger("Alfa:WARN");

module.exports = Logger;
