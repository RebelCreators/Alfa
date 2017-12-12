var afimport = require("afimport");
var Shared = afimport.require("shared");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PayloadSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    contents: {
        type: String,
        required: true
    }
});

var MessageSchema = new Schema({
    payloads: [PayloadSchema],
    date: {type: Date, default: Date.now, required: true},
    senderId: String,
    dialogId: String,
    extras: Schema.Types.Mixed
});

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
}

MessageSchema.statics.fromPublicJSON = function (json) {
    delete json._id;
    var mapped = Shared.caseInsensitiveMap(MessageSchema.obj, json);
    mapped.date = new Date();
    return new MessageModel(mapped);
}

mongoose.model('MessageModel', MessageSchema);

var MessageModel = mongoose.model('MessageModel');
module.exports = MessageModel;