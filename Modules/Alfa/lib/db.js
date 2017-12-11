var mongoose = require( 'mongoose' );
var connection = mongoose.connection;

module.exports.connect = function (url) {
    var self = this;
    return new Promise(function (resolve, reject) {
        mongoose.connect(url);
        connection.on('connected', function () {
            if (mongoose.connection.readyState !== 1) {
                return reject(new Error("DataBase disconnected"));
            }
            console.log('Mongoose default connection open to ' + url);
            resolve()
        });
        connection.on('error',function (err) {
            reject(err);
        });
    });
}

// When the connection is disconnected
connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

module.exports.db = connection;