const mongoose = require( 'mongoose' );
const connection = mongoose.connection;
const afimport = require("afimport");
const logger = afimport.require("logger");


/**
 * DB Module
 * @module DB
 */


/**
 * @function connect
 * @memberof module:DB
 * @param {string} url
 * @return {Promise}
 */
module.exports.connect = function (url) {
    const self = this;
    return new Promise(function (resolve, reject) {
        mongoose.connect(url, { useMongoClient: true });
        connection.on('connected', function () {
            if (mongoose.connection.readyState !== 1) {
                return reject(new Error("DataBase disconnected"));
            }
            logger.info("DB connected");
            resolve()
        });
        connection.on('error',function (err) {
            logger.error("DB connection error" + err);
            reject(err);
        });
    });
}

// When the connection is disconnected
connection.on('disconnected', function () {
    logger.info('DB connection disconnected');
});


// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    connection.close(function () {
        logger.warn('DB connection disconnected through app termination');
        process.exit(0);
    });
});

/**
 * @function db
 * @type {Connection}
 * @memberof module:DB
 */
module.exports.db = connection;