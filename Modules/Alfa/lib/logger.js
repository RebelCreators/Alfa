const Logger = function(name) {
    return require('debug')(name);
};

Logger.error = Logger("Alfa:ERROR");
Logger.info = Logger("Alfa:INFO");
Logger.DEBUG = Logger("Alfa:DEBUG");
Logger.WARN = Logger("Alfa:WARN");

module.exports = Logger;
