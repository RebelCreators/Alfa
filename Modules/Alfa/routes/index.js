var express = require('express');
var router = express.Router();
var afimport = require("afimport");

/**
 *
 * @param filePattern: string
 * @param options: {namespace: string, subpath: string}
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
    if (classNames) {
        for (var i = 0; i < classNames.length; i++) {
            router.use(options.subpath + classNames[i].toLowerCase(), afimport.require(classNames[i], options));
        }
    }
}

/**
 *
 * @type {{namespace: string, subpath: string}}
 */
var defaultOptions = {
    namespace: "com.rebel.creators.routers",
    subpath: "/"
};

/**
 *
 * @param filePattern: string
 * @param options: {namespace:string?, subpath:string?}
 * @returns {Router}
 */
module.exports = function (filePattern, options) {
    resolve(filePattern);
    return router;
};
