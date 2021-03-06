const afimport = require("afimport");
const Shared = afimport.require("shared");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('underscore');

/**
 * The data-layer
 * @module models/DialogTipModel
 */

/**
 *
 * @constructor DialogTipModel
 */
const DialogTipSchema = new Schema({
    /**
     * @memberof module:models/DialogTipModel~DialogTipModel
     * @instance
     *
     * @type {MessageModel}
     */
    message: {type: mongoose.Schema.Types.ObjectId, ref: 'message', required: true},
    /**
     * @memberof module:models/DialogTipModel~DialogTipModel
     * @instance
     *
     * @type {string}
     */
    iden: {type: String, required: true, unique: true}
});

//*********************************************************************************
//*************************** Static Methods

/**
 * @function messageTipForDialog
 * @memberof module:models/DialogTipModel~DialogTipModel
 *
 * @param {string} dialogId
 * @param {string} userId
 * @return {Promise.<DialogTipModel, Error>}
 */
DialogTipSchema.statics.messageTipForDialog = function (dialogId, userId) {
    return new Promise(function (resolve, reject) {
        var query = {iden: "" + dialogId + "#" + userId};

        DialogTipModel.findOne(query).populate('message').exec(function (err, tip) {
            if (err) return reject(err);
            resolve(tip);
        });
    });
};

/**
 *
 * @function setTipForDialog
 * @memberof module:models/DialogTipModel~DialogTipModel
 *
 * @param {string} dialogId
 * @param {string} messageId
 * @param {string} userId
 * @return {Promise.<DialogTipModel, Error>}
 */
DialogTipSchema.statics.setTipForDialog = function (dialogId, messageId, userId) {
    return new Promise(function (resolve, reject) {
        var query = {iden: "" + dialogId + "#" + userId};
        var update = {message: messageId};

        DialogTipModel.findOneAndUpdate(query, update, {
            upsert: true,
            new: true
        }).populate('message').exec(function (err, tip) {
            if (err) return reject(err);
            resolve(tip);
        });
    });
};

mongoose.model('DialogTipModel', DialogTipSchema);

const DialogTipModel = mongoose.model('DialogTipModel');
module.exports = DialogTipModel;
