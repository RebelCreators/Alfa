module.exports = function (express, afimportModule) {
    var app = express;
    var path = require("path");
    var afimport = require("afimport");
    if (afimportModule) {
        afimport.importModule(afimportModule);
    }

    afimport.include([path.join(__dirname, 'lib/**/*'), path.join(__dirname, 'models/**/*')]);

    var oauthserver = require('oauth2-server');
    var helmet = require('helmet');

    var Promise = require("bluebird");
    var mongoose = require('mongoose');
    mongoose.Promise = Promise;
    afimport.provide(mongoose, "mongoose");

// Connection URL
    var config = afimport.require("config");
    var url = config.db;

    var DB = afimport.require("db");
    var oauth2 = afimport.require("oauth2.0");

    var multipart = require('connect-multiparty');
    var bodyParser = require('body-parser');
    var mongoSanitize = require('express-mongo-sanitize');

//provide app to be included in afimport
    afimport.provide(app, "app", {
        namespace: "com.rebelcreators.app"
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
        console.log("DB connected");
    }).catch(function (error) {
        console.log("error " + error);
    });

    app.all('/oauth/token', app.oauth.grant());

    afimport.provide(require(path.join(__dirname, 'routes/index.js')), "router");
    var router = afimport.require('router');
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
}

