var express = require('express');
var router = express.Router();
var afimport = require("afimport");

/**
 * Routes files with provided options
 */

/**
 *
 * @param filePattern: string
 * @param options: {namespace: string, subpath: string, version: string}
 */
function resolve(filePattern, options) {
    var options = options || defaultOptions;
    if (!options.namespace) {
        options.namespace = defaultOptions.namespace;
    }
    if (!options.subpath) {
        options.subpath = defaultOptions.subpath;
    }
    var classNames = afimport.include(filePattern, options);
    var subpath = options.subpath || "";
    var version = options.version || "";
    subpath = subpath.replace(/^^(\/){0,1}([A-Za-z0-9]*)(\/){0,1}/gi, "$2");
    version = version.replace(/^^(\/){0,1}([A-Za-z0-9]*)(\/){0,1}/gi, "$2");
    if (subpath) {
        subpath = subpath + "/";
    }
    if (version) {
        version = version + "/";
    }
    if (classNames) {
        for (var i = 0; i < classNames.length; i++) {
            router.use( "/" + version + subpath + classNames[i].toLowerCase(), afimport.require(classNames[i], options));
        }
    }
}

/**
 *
 * @type {{namespace: string, subpath: string, version: string}}
 */
var defaultOptions = {
    namespace: "com.rebel.creators.routers",
    subpath: null,
    version: null
};

/**
 *
 * @param filePattern: string
 * @param options: {namespace:string?, subpath:string?, version: string}
 * @returns {Router}
 */
module.exports = function (filePattern, options) {
    resolve(filePattern);
    return router;
};
