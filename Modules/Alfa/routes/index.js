var express = require('express');
var router = express.Router();
var afimport = require("afimport");

/**
 * The routing-layer
 * @module Router/Alfa
 */

/**
 * Routes files with provided options
 */

/**
 * @private
 * @param {string} filePattern
 * @param {{namespace: ?string, subpath: ?string, version: ?string}} options
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
 * @expose
 * @type {{namespace: string, subpath: ?string, version: ?string}}
 */
var defaultOptions = {
    /**
     * @memberof module:Router
     * @instance
     *
     * @type {string}
     */
    namespace: "com.rebel.creators.routers",
    /**
     * @memberof module:Router
     * @instance
     *
     * @type {?string}
     */
    subpath: null,
    /**
     * @memberof module:Router
     * @instance
     *
     * @type {?string}
     */
    version: null
};

/**
 *
 * Export Router
 * @param {string} filePattern
 * @param {{namespace: ?string, subpath: ?string, version: ?string}} options
 * @returns {Router}
 */
module.exports = function (filePattern, options) {
    resolve(filePattern);
    return router;
};
