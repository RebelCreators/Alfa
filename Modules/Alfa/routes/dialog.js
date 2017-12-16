const afimport = require("afimport");
const router = afimport.require("ExpressRouter", {
    namespace: "com.rebelcreators.Router"
});
const app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});

const DialogModel = afimport.require("Dialog");
const MessageModel = afimport.require("Message");
const Socket = afimport.require("Socket");

/**
 * PUT /new
 * body: DialogModel
 * response {DialogModel}
 */
router.put('/new', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const json = Object.assign({}, req.body);
    const dialog = DialogModel.fromPublicJSON(json);
    dialog.saveNewDialog(currentUser).then(function (dialog) {
        if (!dialog) {
            res.statusCode = 500;
            throw new Error("Error Saving");
        }
        res.json(dialog.toJSON());
    }).catch(function (error) {
        next(error);
    });
});

/**
 * GET /:dialogId/id
 * query: permissions {PremissionsModel}
 * response {DialogModel}
 */
router.get('/:dialogId/id', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const dialogId = req.params.dialogId;
    const permissions = Object.assign({}, req.query.permissions);

    DialogModel.dialogWithId(dialogId, permissions, currentUser).then(function (dialog) {
        return DialogModel.getSingleDialogUnreadCount(dialog, currentUser._id);
    }).then(function (dialog) {
        res.json(dialog ? dialog.toJSON() : null);
    }).catch(function (error) {
        next(error);
    });
});

/**
 * POST /:dialogId/id
 * body: permissions {PremissionsModel}
 * body: dialogIds {Array.<string>}
 * response {DialogModel}
 */
router.post('/ids', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const permissions = Object.assign({}, req.body.permissions);
    const dialogIds = req.body.dialogIds;
    DialogModel.dialogWithIds(dialogIds, permissions, currentUser).then(function (dialogs) {
        return DialogModel.getDialogUnreadCounts(dialogs, currentUser._id);
    }).then(function (dialogs) {
        if (!dialogs) {
            dialogs = [];
        }
        var dialogsOutput = [];
        for (var i = 0; i < dialogs.length; i++) {
            var dialog = dialogs[i];
            dialogsOutput.push(dialog.toJSON());
        }
        res.json(dialogsOutput);
    }).catch(function (error) {
        next(error);
    });
});

/**
 * GET /find/users
 * query: permissions {PremissionsModel}
 * response {Array.<DialogModel>}
 */
router.get('/find/users', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const permissions = Object.assign({}, req.query.permissions);
    const userIds = req.query.userIds;
    DialogModel.dialogsWithUsers(userIds, currentUser, permissions).then(function (dialogs) {
        return DialogModel.getDialogUnreadCounts(dialogs, currentUser._id);
    }).then(function (dialogs) {
        if (!dialogs) {
            dialogs = [];
        }
        var dialogsOutput = [];
        for (var i = 0; i < dialogs.length; i++) {
            const dialog = dialogs[i];
            dialogsOutput.push(dialog.toJSON());
        }
        res.json(dialogsOutput);
    }).catch(function (error) {
        next(error);
    });
});

/**
 * GET /messages/:dialogId
 * query: permissions {PremissionsModel}
 * query: offset {number}
 * query: limit {number}
 * query: asc {boolean}
 * query: date {string}
 * response {Array.<MessageModel>}
 */
router.get('/messages/:dialogId', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const dialogId = req.params.dialogId;
    const offset = parseInt(req.query.offset);
    const limit = parseInt(req.query.limit);
    const date = null;
    const asc = parseInt(req.query.asc) || 0;
    const timestamp = Date.parse(req.query.date)
    if (isNaN(timestamp) == false) {
        date = new Date(timestamp);

    }
    const permissions = Object.assign({}, req.query.permissions);
    DialogModel.messages(date, offset, limit, asc, dialogId, permissions, currentUser).then(function (messages) {
        var output = [];
        for (var i = 0; i < messages.length; i++) {
            const message = messages[i].toJSON();
            output.push(message);
        }
        res.json(output);
    }).catch(function (error) {
        next(error);
    });
});

/**
 * GET /messages/:dialogId
 * query: toDate {string}
 * query: fromDate {string}
 * response {Array.<MessageModel>}
 */
router.get('/between/messages', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    var fromDate = null;
    var toDate = null;
    const asc = parseInt(req.query.asc) || 0;
    const fromTimestamp = Date.parse(req.query.fromDate);
    const toTimestamp = Date.parse(req.query.toDate);
    if (isNaN(fromTimestamp) == false) {
        fromDate = new Date(fromTimestamp);
    }
    if (isNaN(toTimestamp) == false) {
        toDate = new Date(toTimestamp);
    }
    if (!toDate || !fromDate) {
        const error = new Error("Dates not found");
        error.code = 404;
        next(error);
        return;
    }
    DialogModel.messagesBetweenDates(fromDate, toDate, asc, currentUser).then(function (messages) {
        var output = [];
        for (var i = 0; i < messages.length; i++) {
            const message = messages[i].toJSON();
            output.push(message);
        }
        res.json(output);
    }).catch(function (error) {
        next(error);
    });
});

/**
 * GET /current
 * response {Array.<DialogModel>}
 */
router.get('/current', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    DialogModel.dialogsForUser(currentUser).then(function (dialogs) {
        return DialogModel.getDialogUnreadCounts(dialogs, currentUser._id);
    }).then(function (dialogs) {
        if (!dialogs) {
            dialogs = [];
        }
        var dialogsOutput = [];
        for (var i = 0; i < dialogs.length; i++) {
            const dialog = dialogs[i];
            dialogsOutput.push(dialog.toJSON());
        }
        res.json(dialogsOutput);
    }).catch(function (error) {
        next(error);
    });
});

/**
 * POST /add
 * body: userId {string}
 * body: dialogId {string}
 * body: permissions {PermissionsModel}
 * response {Array.<DialogModel>}
 */
router.post('/add', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const json = Object.assign({}, req.body);
    const user = json.userId;
    const dialogId = json.dialogId;
    const permissions = json.permissions;
    DialogModel.addUser(user, dialogId, currentUser, permissions).then(function (dialog) {
        return DialogModel.getSingleDialogUnreadCount(dialog, currentUser._id);
    }).then(function (dialog) {
        res.json(dialog.toJSON());
    }).catch(function (error) {
        next(error);
    });
});

/**
 * POST /join
 * body: dialogId {string}
 * body: permissions {PermissionsModel}
 * response {Array.<DialogModel>}
 */
router.post('/join', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const json = Object.assign({}, req.body);
    const dialogId = json.dialogId;
    const permissions = json.permissions;
    DialogModel.join(dialogId, currentUser, permissions).then(function (dialog) {
        return DialogModel.getSingleDialogUnreadCount(dialog, currentUser._id);
    }).then(function (dialog) {
        res.json(dialog.toJSON());
    }).catch(function (error) {
        next(error);
    });
});

/**
 * DELETE /leave
 * body: dialogId {string}
 * body: permissions {PermissionsModel}
 * response {Array.<DialogModel>}
 */
router.delete('/leave', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const json = Object.assign({}, req.body);
    const dialogId = json.dialogId;
    const permissions = json.permissions;
    DialogModel.removeUser(currentUser._id, dialogId, currentUser, permissions).then(function (dialog) {
        res.send();
    }).catch(function (error) {
        next(error);
    });
});

/**
 * DELETE /remove
 * body: userId {string}
 * body: dialogId {string}
 * body: permissions {PermissionsModel}
 * response {Array.<DialogModel>}
 */
router.delete('/remove', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const json = Object.assign({}, req.body);
    const user = json.userId;
    const dialogId = json.dialogId;
    const permissions = json.permissions;
    DialogModel.removeUser(user, dialogId, currentUser, permissions).then(function (dialog) {
        res.json(dialog.toJSON());
    }).catch(function (error) {
        next(error);
    });
});

/**
 * PUT /message/send
 * body: message {MessageModel}
 * body: dialogId {string}
 * body: permissions {PermissionsModel}
 * response {Array.<DialogModel>}
 */
router.put('/message/send', app.oauth.authorise(), function (req, res, next) {
    const currentUser = req.oauth.bearerToken.user;
    const json = Object.assign({}, req.body);
    const dialogId = json.dialogId;
    const _messsage = json.message;
    const permissions = json.permissions;
    _messsage.dialogId = dialogId;

    if (!dialogId) {
        return next(new Error("No dialog id provided"));
    }

    DialogModel.dialogForMessage(dialogId, currentUser, permissions).then(function (dialog) {
        const message = MessageModel.fromPublicJSON(_messsage);

        return message.saveMessage(currentUser).then(function (message) {

            return DialogModel.incrementDialog(dialog._id);

        }).then(function (dialog) {

            Socket.send(message.toJSON(), dialog);
            res.json(message.toJSON());
        });
    }).catch(function (error) {
        next(error);
    });
});

module.exports = router;