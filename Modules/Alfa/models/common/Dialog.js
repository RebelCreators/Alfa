var afimport = require("afimport");
var Shared = afimport.require("shared");
var MessageModel = afimport.require('Message');
var DialogTipModel = afimport.require('DialogTip');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/**
 * The data-layer
 * @module models/DialogModel
 */

/**
 * Permission Level Enum.
 *
 * @memberof module:models/DialogModel~PermissionsModel
 *
 * @readonly
 * @enum {string}
 */
var PermissionLevelEnum = {
    /**
     * anyone
     */
    ANYONE: "anyone",
    /**
     * any_participant
     */
    ANYPARTICIPANT: "any_participant",
    /**
     * only_owner
     */
    ONLYOWNER: "only_owner"
};

/**
 *
 * @constructor PermissionModel
 */
var PermissionSchema = new Schema({
    /**
     * @memberof module:models/DialogModel~PermissionsModel
     * @instance
     *
     * @type {PermissionLevelEnum}
     */
    read: {
        type: String,
        enum: [PermissionLevelEnum.ANYONE, PermissionLevelEnum.ANYPARTICIPANT, PermissionLevelEnum.ONLYOWNER],
        required: true
    },
    /**
     * @memberof module:models/DialogModel~PermissionsModel
     * @instance
     *
     * @type {PermissionLevelEnum}
     */
    join: {
        type: String,
        enum: [PermissionLevelEnum.ANYONE, PermissionLevelEnum.ANYPARTICIPANT, PermissionLevelEnum.ONLYOWNER],
        required: true
    },
    /**
     * @memberof module:models/DialogModel~PermissionsModel
     * @instance
     *
     * @type {PermissionLevelEnum}
     */
    write: {
        type: String,
        enum: [PermissionLevelEnum.ANYONE, PermissionLevelEnum.ANYPARTICIPANT, PermissionLevelEnum.ONLYOWNER],
        required: true
    },
    /**
     * @memberof module:models/DialogModel~PermissionsModel
     * @instance
     *
     * @type {PermissionLevelEnum}
     */
    update: {
        type: String,
        enum: [PermissionLevelEnum.ANYONE, PermissionLevelEnum.ANYPARTICIPANT, PermissionLevelEnum.ONLYOWNER],
        required: true
    }
});

/**
 * @private
 * @type {{toObject: {virtuals: boolean}, toJSON: {virtuals: boolean}}}
 */
var schemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

/**
 *
 * @constructor DialogModel
 */
var DialogSchema = new Schema({
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @type {UserModel}
     */
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true},
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @type {string[]}
     */
    currentUsers: [String],
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @type {UserModel[]}
     */
    allUsers: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'}],
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @type {PermissionModel}
     */
    permissions: {type: PermissionSchema, required: true},
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @type {string}
     */
    name: {type: String, required: true},
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @type {string}
     */
    details: {type: String, required: true},
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @default Date.now
     *
     * @type {Date}
     */
    date: {type: Date, default: Date.now},
    /**
     * @memberof module:models/DialogModel~DialogModel
     * @instance
     *
     * @type {number}
     */
    numberOfMessages: Number
}, schemaOptions);

/**
 * @function unreadMessages
 * @memberof module:models/DialogModel~DialogModel
 * @instance
 *
 * @type {string}
 */
DialogSchema.virtual('unreadMessages').get(function () {
    return this._unread;
}).set(function (unread) {
    this._unread = unread;
});

//*********************************************************************************
//*************************** JSON Methods

/**
 *
 * @function fromPublicJSON
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {Object} json
 * @return {DialogModel}
 */
DialogSchema.statics.fromPublicJSON = function (json) {
    json._id = null;
    delete json._id;
    json.creator = null;
    delete json.creator;
    json.currentUsers = null;
    delete json.currentUsers;
    var mapped = Shared.caseInsensitiveMap(DialogSchema.obj, json);
    mapped.currentUsers = _.map(mapped.allUsers, function (obj) {
        return obj._id;
    });
    mapped.date = new Date();
    return new DialogModel(mapped);
};

//*********************************************************************************
//*************************** Public Methods

/**
 *
 * @function saveNewDialog
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {UserModel} currentUser
 * @return {Promise.<DialogModel, Error>}
 */
DialogSchema.methods.saveNewDialog = function (currentUser) {
    var self = this;
    self.creator = currentUser;
    return new Promise(function (resolve, reject) {
        self.save(function (err) {
            if (err) return reject(err);

            DialogModel.populate(self, "_id allUsers creator", function (err, dialog) {
                if (err) return reject(err);
                resolve(dialog);
            });
        });
    });
};

//*********************************************************************************
//*************************** Static Methods

/**
 *
 * @function addUser
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {string} userId
 * @param {string} dialogId
 * @param {UserModel} currentUser
 * @param {PermissionsModel} permissions
 * @return {Promise.<DialogModel, Error>}
 */
DialogSchema.statics.addUser = function (userId, dialogId, currentUser, permissions) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var updatePermissions = permissions["update"];
        if (!updatePermissions) {
            return reject(new Error("Permissions not set"));
        }
        var query = {
            $and: [{currentUsers: {$ne: userId}}],
            _id: dialogId,
            "permissions.update": updatePermissions
        };

        if (updatePermissions == "any_participant") {
            var and = query.$and;
            and.push({currentUsers: currentUser._id});
            query.$and = and;
        } else if (updatePermissions == "only_owner") {
            var and = query.$and;
            and.push({creator: currentUser});
            query.$and = and;
        }

        DialogModel.findOneAndUpdate(query, {
            $addToSet: {
                currentUsers: userId,
                allUsers: userId
            }
        }, {new: true}).populate('allUsers creator').exec(function (err, obj) {
            if (err) return reject(err);
            if (!obj) return reject(new Error("No such dialog"));

            resolve(obj);
        });
    });
};

/**
 * @function dialogsForUser
 * @memberof module:models/DialogModel~DialogModel
 * 
 * @param {UserModel} user
 * @return {Promise.<Array.<DialogModel, Error>>}
 */
DialogSchema.statics.dialogsForUser = function (user) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var query = {
            currentUsers: user._id
        };

        DialogModel.find(query).populate('allUsers creator').exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
};

/**
 *
 * @function dialogForMessage
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {string} dialogId
 * @param {UserModel} currentUser
 * @param {PermissionModel} permissions
 * @return {Promise.<DialogModel, Error>}
 */
DialogSchema.statics.dialogForMessage = function (dialogId, currentUser, permissions) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var writePermissions = permissions["write"];
        if (!writePermissions) {
            return reject(new Error("Permissions not set"));
        }
        var query = {
            _id: dialogId,
            "permissions.write": writePermissions
        };

        if (writePermissions == "any_participant") {
            query.$and = [{currentUsers: currentUser._id}];
        } else if (writePermissions == "only_owner") {
            query.$and = [{creator: currentUser}];
        }

        DialogModel.findOne(query, function (err, obj) {
            if (err) return reject(err);
            if (!obj) return reject(new Error("No such dialog"));

            resolve(obj);
        });
    });
};

/**
 *
 * @function dialogWithId
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {string} dialogId
 * @return {Promise.<DialogModel, Error>}
 */
DialogSchema.statics.dialogWithId = function (dialogId, permissions, currentUser) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var readPermissions = permissions["read"];
        if (!readPermissions) {
            return reject(new Error("Permissions not set"));
        }
        var query = {
            _id: dialogId,
            "permissions.read": readPermissions
        };

        if (readPermissions == "any_participant") {
            query.$and = [{currentUsers: currentUser._id}];
        } else if (readPermissions == "only_owner") {
            query.$and = [{creator: currentUser}];
        }

        DialogModel.findOne(query).populate('allUsers creator').exec(function (err, obj) {
            if (err) return reject(err);
            if (!obj) {
                var error = new Error("dialog not found");
                error.code = 404;
                reject(error);
                return;
            }
            resolve(obj);
        });
    });
};

/**
 *
 * @function dialogWithIds
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {Array.<string>} dialogId
 * @param {PermissionsModel} permissions
 * @param {UserModel} currentUser
 * @return {Promise.<Array.<DialogModel>, Error>}
 */
DialogSchema.statics.dialogWithIds = function (dialogIds, permissions, currentUser) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var readPermissions = permissions["read"];
        if (!readPermissions) {
            return reject(new Error("Permissions not set"));
        }
        var query = {
            _id: {$in: dialogIds},
            "permissions.read": readPermissions
        };

        if (readPermissions == "any_participant") {
            query.$and = [{currentUsers: currentUser._id}];
        } else if (readPermissions == "only_owner") {
            query.$and = [{creator: currentUser}];
        }

        DialogModel.find(query).populate('allUsers creator').exec(function (err, objs) {
            if (err) return reject(err);
            if (!objs) {
                var error = new Error("dialog not found");
                error.code = 404;
                reject(error);
                return;
            }

            resolve(objs);
        });
    });
};

/**
 *
 * @function dialogsWithUsers
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {Array.<string>} users
 * @param {UserModel} currentUser
 * @param {PermissionsModel} permissions
 * @return {Promise.<Array.<DialogModel>, Error>}
 */
DialogSchema.statics.dialogsWithUsers = function (users, currentUser, permissions) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var readPermissions = permissions["read"];
        if (!readPermissions) {
            return reject(new Error("Permissions not set"));
        }
        var query = {
            $and: [{currentUsers: {$all: users}}],
            "permissions.read": readPermissions
        };

        if (readPermissions == "any_participant") {
            var and = query.$and;
            and.push({currentUsers: currentUser._id});
            query.$and = and;
        } else if (readPermissions == "only_owner") {
            var and = query.$and;
            and.push({creator: currentUser});
            query.$and = and;
        }

        DialogModel.find(query).populate('allUsers creator').exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
};

/**
 *
 * @function getDialogUnreadCounts
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {Array.<DialogModel>} dialogs
 * @param {string} currentUserId
 * @return {Promise.<Array.<DialogModel>, Error>}
 */
DialogSchema.statics.getDialogUnreadCounts = function (dialogs, currentUserId) {
    var success = true;
    return new Promise(function (resolve, reject) {
        Shared.asyncForEachAsync(dialogs, function (nextTick, key, dialog) {
            var dialogId = dialog._id.toString();
            DialogTipModel.messageTipForDialog(dialogId, currentUserId)
                .then(function (tip) {
                    if (!tip) {
                        var query = {dialogId: dialogId};
                        MessageModel.count(query, function (err, c) {
                            var count = c || 0;
                            dialog.unreadMessages = c;
                            nextTick();
                        });
                        return;
                    }
                    var messageDate = tip.message.date;
                    var query = {"date": {$gt: messageDate}, dialogId: dialogId};
                    MessageModel.count(query, function (err, c) {
                        var count = c || 0;
                        dialog.unreadMessages = c;
                        nextTick();
                    });
                }).catch(function (error) {
                if (success) {
                    success = false;
                    reject(error);
                }
                nextTick();
            });
        }, function () {
            if (success) {
                resolve(dialogs);
            }
        });
    });
};

/**
 *
 * @function getSingleDialogUnreadCount
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {DialogModel} dialog
 * @param {string} currentUserId
 * @return {Promise.<Array.<DialogModel>, Error>}
 */
DialogSchema.statics.getSingleDialogUnreadCount = function (dialog, currentUserId) {
    return DialogModel.getDialogUnreadCounts([dialog], currentUserId).then(function (dialogs) {
        return dialogs[0];
    });
};

/**
 * @function incrementDialog
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {string} dialogId
 * @return {Promise.<DialogModel, Error>}
 */
DialogSchema.statics.incrementDialog = function (dialogId) {
    return new Promise(function (resolve, reject) {
        var update = {$inc: {numberOfMessages: 1}, $currentDate: {date: true}};
        DialogModel.findOneAndUpdate({_id: dialogId}, update, {new: true}, function (err, dialog) {
            if (err) return reject(err);
            if (!dialog) return reject(new Error("No such dialog"));

            resolve(dialog);
        });
    });
};

/**
 *
 * @function join
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {string} dialogId
 * @param {UserModel} currentUser
 * @param {PermissionsModel} permissions
 * @return {Promise.<DialogModel, Error>}
 */
DialogSchema.statics.join = function (dialogId, currentUser, permissions) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var joinPermissions = permissions["join"];
        if (!joinPermissions) {
            return reject(new Error("Permissions not set"));
        }
        var query = {
            $and: [{currentUsers: {$ne: currentUser._id}}],
            _id: dialogId,
            "permissions.join": joinPermissions
        };

        if (joinPermissions == "only_owner") {
            var and = query.$and;
            and.push({creator: currentUser});
            query.$and = and;
        }

        DialogModel.findOneAndUpdate(query, {
            $addToSet: {
                currentUsers: currentUser._id,
                allUsers: currentUser._id
            }
        }, {new: true}).populate('allUsers creator').exec(function (err, obj) {
            if (err) return reject(err);
            if (!obj) return reject(new Error("No such dialog"));

            resolve(obj);
        });
    });
};

/**
 *
 * @function messsages
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {Date} date
 * @param {number} offset
 * @param {number} limit
 * @param {boolean} asc
 * @param {string} dialogId
 * @param {PermissionsModel} permissions
 * @param {UserModel} currentUser
 * @return {Promise.<Array.<MessageModel>, Error>}
 */
DialogSchema.statics.messages = function (date, offset, limit, asc, dialogId, permissions, currentUser) {
    var self = this;
    return DialogModel.dialogWithId(dialogId, permissions, currentUser).then(function (dialog) {
        return MessageModel.messages(date, offset, limit, asc, dialog._id);
    });
};

/**
 *
 * @function messagesBetweenDates
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {Date} fromDate
 * @param {Date} toDate
 * @param {boolean} asc
 * @param {UserModel} currentUser
 * @return {Promise.<Array.<MessageModel>, Error>}
 */
DialogSchema.statics.messagesBetweenDates = function (fromDate, toDate, asc, currentUser) {
    return DialogModel.dialogsForUser(currentUser).then(function (dialogs) {
        var dialogIds = (dialogs || []).map(function (obj) {
            return obj._id;
        });
        return MessageModel.messagesBetweenDates(fromDate, toDate, asc, dialogIds);
    });
};

/**
 *
 * @function removeUser
 * @memberof module:models/DialogModel~DialogModel
 *
 * @param {string} userId
 * @param {string} dialogId
 * @param {UserModel} currentUser
 * @param {PermissionsModel} permissions
 * @return {Promise.<DialogModel, Error>}
 */
DialogSchema.statics.removeUser = function (userId, dialogId, currentUser, permissions) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var updatePermissions = permissions["update"];
        if (!updatePermissions) {
            return reject(new Error("Permissions not set"));
        }

        var query = {
            $and: [{currentUsers: userId}],
            _id: dialogId,
            "permissions.update": updatePermissions
        };

        if (userId != currentUser._id.toString()) {
            if (updatePermissions == "any_participant") {
                var and = query.$and;
                and.push({currentUsers: currentUser._id});
                query.$and = and;
            } else if (updatePermissions == "only_owner") {
                var and = query.$and;
                and.push({creator: currentUser});
                query.$and = and;
            }
        }
        DialogModel.findOneAndUpdate(query, {
            $pull: {
                currentUsers: userId
            }
        }, {new: true}).populate('allUsers creator').exec(function (err, obj) {
            if (err) return reject(err);
            if (!obj) return reject(new Error("No such dialog"));

            resolve(obj);
        });
    });
};

mongoose.model('DialogModel', DialogSchema);

var DialogModel = mongoose.model('DialogModel');
module.exports = DialogModel;
