const path = require("path");
const afimport = require("afimport");
afimport.include(path.join(__dirname, 'lib/environment.js'), {
    override: true
});
afimport.include(path.join(__dirname, 'lib/logger.js'), {
    override: true
});
const logger = afimport.require("logger");

const execute = function (express, afimportModule) {
    afimport.provide(express, "express");
    const app = express();

    afimport.include([path.join(__dirname, 'lib/**/*'), path.join(__dirname, 'models/**/*')]);

    const oauthserver = require('oauth2-server');
    const helmet = require('helmet');

    const Promise = require("bluebird");
    const mongoose = require('mongoose');
    mongoose.Promise = Promise;
    afimport.provide(mongoose, "mongoose");

// Connection URL
    const url = process.env.ALFA_DB;

    const DB = afimport.require("db");
    const oauth2 = afimport.require("oauth2.0");

    const multipart = require('connect-multiparty');
    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');

//provide app to be included in afimport
    afimport.provide(app, "app", {
        namespace: "com.rebelcreators.app"
    });
    afimport.provide(express.Router, "ExpressRouter", {
        namespace: "com.rebelcreators.Router"
    });

    app.use(helmet());
    app.disable('etag');
    app.use(multipart({uploadDir: path.join(__dirname, 'tmp')}));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(mongoSanitize());
    app.use(function (req, res, next) {
        if (req["files"]) {
            req["files"] = mongoSanitize.sanitize(req["files"]);
        }
        next();
    });

    app.oauth = oauthserver({
        model: oauth2,
        grants: ['password', 'refresh_token'],
        debug: true,
        passthroughErrors: true,
        accessTokenLifetime: 60 * 60 * 2
    });

    app.use(app.oauth.errorHandler());

    DB.connect(url).then(function () {
        logger.info("App - connected DB");
    }).catch(function (error) {
        logger.error("error " + error);
    });

    app.all('/oauth/token', app.oauth.grant());

    afimport.provide(require(path.join(__dirname, 'routes/index.js')), "router");
    const router = afimport.require('router');
    app.use('/', router(path.join(__dirname, 'routes/**/*')));

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.code = 404;
        next(err);
    });

    app.use(function (req, res, next) {
        var err = new Error('Access Denied');
        err.code = 401;
        next(err);
    });

// error handlers

    app.use(function (err, req, res, next) {

        if (err.code == 0) {
            res.statusCode = 500;
            err.message = "Internal Server Error";
        } else {
            res.statusCode = err.code;
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
            res.statusCode = 500;
            err.code = 500;
            err.message = "Internal Server Error";
        }

        if (err.code > 599) {
            err.code = 500;
            res.statusCode = 500;
        }

        res.statusCode = (parseInt(err.code) || res.statusCode || 500 );
        res.json({
            message: err.message
        });
    });

    afimport.require("Socket").connect();

    module.exports.afimport = afimport.exportModule();
    module.exports.app = app;

    require("./server.js")(app);

    return module.exports.afimport;
};

module.exports = execute;
module.exports.cluster = function (callback) {
    const cluster = require('cluster');
    const fs = require("fs");
// Pidfile contains master process PID.
    var pidfile = 'master.pid'

// Map of workers (PID -> worker).
    var workers = {};

    if (cluster.isMaster) {
        process.title = "com.rebelcreators.alfa.master"
        const cpuCount = require('os').cpus().length;
        for (var i = 0; i < cpuCount; i += 1) {
            var worker = cluster.fork();
            var pid = worker.process.pid;
            workers[pid] = worker;
        }

        cluster.on('died', function (worker) {
            logger.warn('Worker ' + process.pid + ' died.');
            // Remove dead worker.
            delete workers[process.pid];

            if (worker.exitedAfterDisconnect) {
                return;
            }

            // Restart on worker death.

            logger.info('Worker ' + process.pid + ' restarting.');
            worker = cluster.fork();
            workers[process.pid] = worker;
        });

        // Attach signal handler to kill workers
        // when master is terminated.

        function cleanup() {
            logger.warn('Master stopping.');

            for (var pid in workers) {
                logger.warn('Kill worker: ' + pid);
                process.kill(pid)
            }

            // Remove pidfile.

            fs.unlinkSync(pidfile);
            workers = {};

            process.exit(0);
        }

        // Master can be terminated by either SIGTERM
        // or SIGINT. The latter is used by CTRL+C on console.

        process.on('SIGTERM', cleanup);
        process.on('SIGINT', cleanup);

        // Write pidfile.

        fs.writeFileSync(pidfile, process.pid);
    } else {

        process.title = "com.rebelcreators.alfa.worker"
        process.on('SIGTERM', function () {
            logger.warn('Stopping worker ' + process.pid);
        });

        logger.info('Worker ' + process.pid + ' started.');

        callback(module.exports);
    }
};