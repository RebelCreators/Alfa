var afimport = require("afimport");
var Shared = afimport.require("shared");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/**
 *
 * @type {DialogTipSchema}
 */
var DialogTipSchema = new Schema({
    message: {type: mongoose.Schema.Types.ObjectId, ref: 'message', required: true},
    iden: {type: String, required: true, unique: true}
});

//*********************************************************************************
//*************************** Static Methods

/**
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

/**
 * @constructor
 */
var DialogTipModel = mongoose.model('DialogTipModel');
module.exports = DialogTipModel;
