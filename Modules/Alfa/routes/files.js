var express = require('express');
var router = express.Router();
var fs = require("fs");
var afimport = require("afimport");
var app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
var s3 = afimport.require('s3');
var uuid = require('node-uuid');
var AWS_BUCKET = 'hothelpers';

router.all('*', app.oauth.authorise(), function (req, res, next) {
    next();
});

/**
 * POST /upload
 * files {max = 5}
 * response {Array.<string>}
 */
router.post('/upload', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var filesObject = req.files;
    var maxUploadLimit = 5;
    if (!filesObject) {
        return next(new Error("No files"));
    }
    var files = [];
    var file = filesObject["file"];
    if (!file) {
        return next(new Error("No files"));
    }
    files.push(file);
    for (var i = 0; i < maxUploadLimit; i++) {
        var file = filesObject["file" + i];
        if (!file) {
            break;
        }
        files.push(file);
    }

    var promise = null;
    var response = [];
    for (var i = 0; i < files.length; i++) {
        (function () {
            var file = files[i];
            var path = file.path;
            if (!promise) {
                promise = uploadFile(path, currentUser._id).then(function (fileId) {
                    console.log("Successfully uploaded file: ", fileId, " ", path);
                    response.push(fileId);
                });
            } else {
                promise = promise.then(function () {
                    return uploadFile(path, currentUser._id).then(function (fileId) {
                        console.log("Successfully uploaded file: ", fileId, " ", path);
                        response.push(fileId);
                    });
                });
            }
        })();
    }

    promise.then(function () {
        res.json(response);
    }).catch(function (err) {
        next(new Error("No files"));
    });
});

/**
 * GET /:fileId/download
 * response {Data}
 */
router.get('/:fileId/download', function (req, res, next) {
    var fileId = req.params.fileId;
    var path = fileId;
    downloadFile(path, res, next);
});

/**
 * @private
 * @param filePath
 * @param userId
 * @return {Promise}
 */
var uploadFile = function (filePath, userId) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, function (err, data) {
            fs.unlink(filePath, function (err) {
                if (err) {
                    console.error(err);
                }
            });
            if (err) return reject(err);
            var fileId = uuid.v1();
            var path = userId + "." + fileId;
            var params = {Bucket: AWS_BUCKET, Key: path, Body: data};

            s3.S3.putObject(params, function (err, data) {
                if (err) return reject(err);
                resolve(path);
            });
        });
    });
};

/**
 * @private
 * @param fileId
 * @param res
 * @param next
 */
var downloadFile = function (fileId, res, next) {
    s3.S3.getObject({
        Bucket: AWS_BUCKET,
        Key: fileId
    }).createReadStream().on('error', function (err) {
        next(new Error("File Not Found"));
    }).pipe(res);
};

module.exports = router;