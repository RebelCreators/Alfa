const afimport = require("afimport");
const logger = afimport.require("logger");


/**
 * Shared
 * @module Shared
 */


/**
 *
 * Gets the first value in an array.
 *
 * @function first
 * @memberof module:Shared
 *
 * @param {Array<T>} arr
 * @return {?T}
 */
module.exports.first = function (arr) {
    return arr.length > 0 ? arr[0] : null;
};


/**
 *
 * Gets the last value in an array.
 *
 * @function last
 * @memberof module:Shared
 *
 * @param {Array<T>} arr
 * @return {?T}
 */
module.exports.last = function (arr) {
    return arr.length > 0 ? arr[arr.length - 1] : null;
};


/**
 * Maps an object's keys and values to a new object matching keys of the second object passed in.
 *
 * @function caseInsensitiveMap
 * @memberof module:Shared
 *
 * @param {Object<T>} from
 * @param {Object<T>} object
 * @param {boolean} includeNUll decides if null values should be ignored or explicitly added
 * @return {Object<T>}
 */
module.exports.caseInsensitiveMap = function (from, object, includeNUll) {
    var lowerCased = {};
    var newObj = {};
    for (key in object) {
        lowerCased[key.toLowerCase()] = object[key];
    }

    for (key in from) {
        var value = lowerCased[key.toLowerCase()];
        if (value || includeNUll) {
            newObj[key] = value;
        }
    }

    return newObj;
};


/**
 *
 * @function printObj
 * @memberof module:Shared
 *
 * Prints an object's keys and values as JSON
 * @param {string} obj
 */
module.exports.printObj = function (obj) {
    logger.info("" + JSON.stringify(obj));
};


// in node 0.9.0, process.nextTick fired before IO events, but setImmediate did
// not yet exist. before 0.9.0, process.nextTick between IO events, and after
// 0.9.0 it fired before IO events. if setImmediate and process.nextTick are
// both missing fall back to the tick shim.
var tick =
    (global.process && process.versions && process.versions.node === '0.9.0') ?
        tickShim :
        (global.setImmediate || (global.process && process.nextTick) || tickShim);

function tickShim(fn) {
    setTimeout(fn, 1);
}

/**
 * Array Iterator
 *
 * @callback ArrayIterator<T>
 * @param {int} index
 * @param {T} valueAtIndex
 * @param {?Array<T>} Array
 */

/**
 * Object Iterator
 *
 * @callback ObjectIterator<K:V>
 * @param {K} objectProperty
 * @param {V} valueForProperty
 * @param {?Object<K:V>} Object
 */

/**
 *  AsyncForEach completion, called once all iteration is finished
 *
 * @callback AsyncForEachArrayCompletion<T>
 *
 * @param {?Array<T>} Object
 */

/**
 *  AsyncForEach completion, called once all iteration is finished
 *
 * @callback AsyncForEachObjectCompletion<K:V>
 *
 * @param {?Object<K:V>} Object
 */

/**
 * Asynchronously iterates an array or object key
 * @function asyncForEach
 * @memberof module:Shared
 *
 * @param {Array<T>|Object<K:V>} object
 * @param {ArrayIterator<T>|ObjectIterator<K:V>} iter
 * @param {(AsyncForEachArrayCompletion<T>|AsyncForEachObjectCompletion<K:V>)=} completion
 */

module.exports.asyncForEach = function (object, iter, completion) {
    var keys = Object.keys(object), offset = 0;

    (function next() {
        // invoke the iterator function
        iter.call(object, keys[offset], object[keys[offset]], object);

        if (++offset < keys.length) {
            tick(next);
        } else {
            if (completion) {
                completion.call(object);
            }
        }
    })();
};


/**
 *  @callback NextTick
 */


/**
 * Array iterator with nextTick
 *
 * @callback AyncArrayIterator<T>
 * @param {NextTick} nextTick  function() to be called to signal an iteration is finished
 * @param {int} index
 * @param {T} valueAtIndex
 * @param {?Array<T>} Array
 */

/**
 * Object iterator with nextTick
 *
 * @callback AyncObjectIterator<K:V>
 * @param {NextTick} nextTick function() to be called to signal an iteration is finished
 * @param {K} objectProperty
 * @param {V} valueForProperty
 * @param {?Object<K:V>} Object
 */

/**
 *
 * Asynchronously iterates an array or object keys it passes in a nextTick funtion and defers the next loop until the next tick function is called
 * @function asyncForEachAsync
 * @memberof module:Shared
 *
 * @param {Array<T>|Object<K:V>} object
 * @param {AyncArrayIterator<T>|AyncObjectIterator<K:V>} iter
 * @param {(AsyncForEachArrayCompletion<T>|AsyncForEachObjectCompletion<K:V>)=} completion
 */
module.exports.asyncForEachAsync = function (object, iter, completion) {
    var keys = Object.keys(object), offset = 0;
    if (!keys || keys.length == 0) {
        if (completion) {
            completion([]);
        }
        return;
    }
    (function next() {
        // invoke the iterator function

        var nextTick = function () {
            if (++offset < keys.length) {
                tick(next);
            } else {
                if (completion) {
                    completion.call(object);
                }
            }
        };
        iter.call(object, nextTick, keys[offset], object[keys[offset]], object);
    })();
};


/**
 * Initializes a prototype with a superclass
 *
 * @function initClass
 * @memberof module:Shared
 *
 * @param Clazz
 * @param Superclass
 */
module.exports.initClass = function (Clazz, Superclass) {
    if (Superclass) {
        Clazz.prototype = Object.create(Superclass.prototype);
        Clazz.prototype.constructor = Clazz;
        Clazz.super = Superclass;
    }
}