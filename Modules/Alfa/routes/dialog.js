var express = require('express');
var router = express.Router();
var afimport = require("afimport");
var app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});

var DialogModel = afimport.require("Dialog");
var MessageModel = afimport.require("Message");
var Socket = afimport.require("Socket");

router.put('/new', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var json = Object.assign({}, req.body);
    var dialog = DialogModel.fromPublicJSON(json);
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

router.get('/:dialogId/id', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var dialogId = req.params.dialogId;
    var permissions = Object.assign({}, req.query.permissions);

    DialogModel.dialogWithId(dialogId, permissions, currentUser).then(function (dialog) {
        return DialogModel.getSingleDialogUnreadCount(dialog, currentUser._id);
    }).then(function (dialog) {
        res.json(dialog ? dialog.toJSON() : null);
    }).catch(function (error) {
        next(error);
    });
});

router.post('/ids', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var permissions = Object.assign({}, req.body.permissions);
    var dialogIds = req.body.dialogIds;
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

router.get('/find/users', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var permissions = Object.assign({}, req.query.permissions);
    var userIds = req.query.userIds;
    DialogModel.dialogsWithUsers(userIds, currentUser, permissions).then(function (dialogs) {
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


router.get('/messages/:dialogId', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var dialogId = req.params.dialogId;
    var offset = parseInt(req.query.offset);
    var limit = parseInt(req.query.limit);
    var date = null;
    var asc = parseInt(req.query.asc) || 0;
    var timestamp = Date.parse(req.query.date)
    if (isNaN(timestamp) == false) {
        date = new Date(timestamp);

    }
    var permissions = Object.assign({}, req.query.permissions);
    DialogModel.messages(date, offset, limit, asc, dialogId, permissions, currentUser).then(function (messages) {
        var output = [];
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i].toJSON();
            output.push(message);
        }
        res.json(output);
    }).catch(function (error) {
        next(error);
    });
});

router.get('/between/messages', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var fromDate = null;
    var toDate = null;
    var asc = parseInt(req.query.asc) || 0;
    var fromTimestamp = Date.parse(req.query.fromDate);
    var toTimestamp = Date.parse(req.query.toDate);
    if (isNaN(fromTimestamp) == false) {
        fromDate = new Date(fromTimestamp);
    }
    if (isNaN(toTimestamp) == false) {
        toDate = new Date(toTimestamp);
    }
    if (!toDate || !fromDate) {
        var error = new Error("Dates not found");
        error.code = 404;
        next(error);
        return;
    }
    DialogModel.messagesBetweenDates(fromDate, toDate, asc, currentUser).then(function (messages) {
        var output = [];
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i].toJSON();
            output.push(message);
        }
        res.json(output);
    }).catch(function (error) {
        next(error);
    });
});

router.get('/current', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    DialogModel.dialogsForUser(currentUser).then(function (dialogs) {
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

router.post('/add', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var json = Object.assign({}, req.body);
    var user = json.userId;
    var dialogId = json.dialogId;
    var permissions = json.permissions;
    DialogModel.addUser(user, dialogId, currentUser, permissions).then(function (dialog) {
        return DialogModel.getSingleDialogUnreadCount(dialog, currentUser._id);
    }).then(function (dialog) {
        res.json(dialog.toJSON());
    }).catch(function (error) {
        next(error);
    });
});

router.post('/join', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var json = Object.assign({}, req.body);
    var dialogId = json.dialogId;
    var permissions = json.permissions;
    DialogModel.join(dialogId, currentUser, permissions).then(function (dialog) {
        return DialogModel.getSingleDialogUnreadCount(dialog, currentUser._id);
    }).then(function (dialog) {
        res.json(dialog.toJSON());
    }).catch(function (error) {
        next(error);
    });
});

router.delete('/leave', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var json = Object.assign({}, req.body);
    var dialogId = json.dialogId;
    var permissions = json.permissions;
    DialogModel.removeUser(currentUser._id, dialogId, currentUser, permissions).then(function (dialog) {
        res.send();
    }).catch(function (error) {
        next(error);
    });
});

router.delete('/remove', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var json = Object.assign({}, req.body);
    var user = json.userId;
    var dialogId = json.dialogId;
    var permissions = json.permissions;
    DialogModel.removeUser(user, dialogId, currentUser, permissions).then(function (dialog) {
        res.json(dialog.toJSON());
    }).catch(function (error) {
        next(error);
    });
});

router.put('/message/send', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    var json = Object.assign({}, req.body);
    var dialogId = json.dialogId;
    var _messsage = json.message;
    var permissions = json.permissions;
    _messsage.dialogId = dialogId;

    if (!dialogId) {
        return next(new Error("No dialog id provided"));
    }

    DialogModel.dialogForMessage(dialogId, currentUser, permissions).then(function (dialog) {
        var message = MessageModel.fromPublicJSON(_messsage);

        return message.saveMessage(currentUser).then(function (message) {

            return DialogModel.incrementDialog(dialog._id);

        }).then(function (dialog) {

            Socket.send(message, dialog);
            res.json(message.toJSON());
        });
    }).catch(function (error) {
        next(error);
    });
});

module.exports = router;