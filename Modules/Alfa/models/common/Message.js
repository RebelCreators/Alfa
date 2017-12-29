const afimport = require("afimport");
const Shared = afimport.require("shared");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * The data-layer
 * @module models/MessageModel
 */

/**
 *
 * @constructor PayloadModel
 */
const PayloadSchema = new Schema({
    /**
     * @memberof module:models/MessageModel~PayloadModel
     * @instance
     *
     * @type {string}
     */
    type: {
        type: String,
        required: true
    },
    /**
     * @memberof module:models/MessageModel~PayloadModel
     * @instance
     *
     * @type {string}
     */
    contents: {
        type: String,
        required: true
    }
});

/**
 *
 * @constructor MessageModel
 */
const MessageSchema = new Schema({
    /**
     * @memberof module:models/MessageModel~MessageModel
     * @instance
     *
     * @type {PayloadModel}
     */
    payloads: [PayloadSchema],
    /**
     * @memberof module:models/MessageModel~MessageModel
     * @instance
     *
     * @type {string}
     */
    pushConfig: String,
    /**
     * @memberof module:models/MessageModel~MessageModel
     * @instance
     *
     * @default Date.now
     *
     * @type {Date}
     */
    date: {type: Date, default: Date.now, required: true},
    /**
     * @memberof module:models/MessageModel~MessageModel
     * @instance
     *
     * @type {string}
     */
    senderId: String,
    /**
     * @memberof module:models/MessageModel~MessageModel
     * @instance
     *
     * @type {string}
     */
    dialogId: String,
    /**
     * @memberof module:models/MessageModel~MessageModel
     * @instance
     *
     * @type {Object}
     */
    extras: Schema.Types.Mixed
});

//*********************************************************************************
//*************************** JSON Methods

/**
 *
 * @function fromPublicJSON
 * @memberof module:models/MessageModel~MessageModel
 *
 * @param {Object} json
 * @return {MessageModel}
 */
MessageSchema.statics.fromPublicJSON = function (json) {
    delete json._id;
    var mapped = Shared.caseInsensitiveMap(MessageSchema.obj, json);
    mapped.date = new Date();
    return new MessageModel(mapped);
};

//*********************************************************************************
//*************************** Public Methods

/**
 *
 * @function saveMessage
 * @memberof module:models/MessageModel~MessageModel
 * @instance
 *
 * @param {UserModel} currentUser
 * @return {Promise.<MessageModel, Error>}
 */
MessageSchema.methods.saveMessage = function (currentUser) {
    var self = this;
    self.creator = currentUser;
    self.date = new Date();
    return new Promise(function (resolve, reject) {
        self.save(function (err) {
            if (err) return reject(err);
            MessageModel.populate(self, "_id", function (err, message) {
                if (err) return reject(err);
                if (!message) return reject(new Error("Error Saving Message"));
                resolve(message);
            });
        });
    });
};

//*********************************************************************************
//*************************** Static Methods

/**
 *
 * @function messages
 * @memberof module:models/MessageModel~MessageModel
 *
 * @param {Date} date
 * @param {number} offset
 * @param {number} limit
 * @param {boolean} asc
 * @param {string} dialogId
 * @return {Promise.<MessageModel, Error>}
 */
MessageSchema.statics.messages = function (date, offset, limit, asc, dialogId) {
    var _limit = limit < 30 ? limit : 30;
    return new Promise(function (resolve, reject) {
        var query = {dialogId: dialogId};
        if (date) {
            query["date"] = {$lte: date};
        }
        MessageModel.find(query).skip(offset).sort({'date': asc ? 1 : -1}).limit(limit).exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
};

/**
 *
 * @function messagesBetweenDates
 * @memberof module:models/MessageModel~MessageModel
 *
 * @param {Date} fromDate
 * @param {date} toDate
 * @param {boolean} asc
 * @param {string} dialogIds
 * @return {Promise.<MEssageModel, Error>}
 */
MessageSchema.statics.messagesBetweenDates = function (fromDate, toDate, asc, dialogIds) {
    return new Promise(function (resolve, reject) {
        var query = {
            dialogId: {$in: dialogIds},
            $and: [{
                date: {$lte: toDate}
            }, {
                date: {$gte: fromDate}
            }]
        };
        MessageModel.find(query).sort({'date': asc ? 1 : -1}).exec(function (err, objs) {
            if (err) return reject(err);
            resolve(objs);
        });
    });
};

mongoose.model('MessageModel', MessageSchema);

const MessageModel = mongoose.model('MessageModel');
module.exports = MessageModel;