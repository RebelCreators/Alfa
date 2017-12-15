const Shared = function () {
}

module.exports.first = function (arr) {
    return arr.length > 0 ? arr[0] : null;
};

module.exports.last = function (arr) {
    return arr.length > 0 ? arr[arr.length - 1] : null;
};

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

module.exports.printObj = function (obj) {
    console.log("" + JSON.stringify(obj));
};

module.exports.rcmap = function (obj, func) {
    var newObj = {};
    for (key in obj) {
        if (func(key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
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

// executes the iter function for the first object key immediately, can be
// tweaked to instead defer immediately
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

module.exports.asyncForEachAsync = function (object, iter, completion) {
    var keys = Object.keys(object), offset = 0;
    if (!keys || keys.length == 0) {
        completion([]);
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

module.exports.initClass = function (Clazz, Superclass) {
    if (Superclass) {
        Clazz.prototype = Object.create(Superclass.prototype);
        Clazz.prototype.constructor = Clazz;
        Clazz.super = Superclass;
    }
}