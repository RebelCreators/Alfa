var express = require('express');
var router = express.Router();
var afimport = require("afimport");
var app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
var UserModel = afimport.require("User");

router.get('/', function (req, res, next) {
    res.json({error: "resouce needed"});
});

router.get('/:userId/id', app.oauth.authorise(), function (req, res, next) {
    var userId = req.params.userId;
    UserModel.getUserById(userId).then(function (user) {
        if (!user) {
            res.statusCode = 404;
            throw new Error("Resource not found");
        }

        res.json(user.toPublicJSON());
    }).catch(function (error) {
        next(error);
    });
});

router.get('/id', app.oauth.authorise(), function (req, res, next) {
    var userIds = req.query.userIDs;
    UserModel.getUsersByIds(userIds).then(function (users) {
        var u = []
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
         u.push(user.toPublicJSON())
        }
        res.json(u);
    }).catch(function (error) {
        next(error);
    });
});

router.get('/username', app.oauth.authorise(), function (req, res, next) {
    var usernames = req.query.userNames;
    UserModel.getUsersByUserNames(usernames).then(function (users) {
        var u = []
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            u.push(user.toPublicJSON())
        }
        res.json(u);
    }).catch(function (error) {
        next(error);
    });
});

router.get('/:userName/username', app.oauth.authorise(), function (req, res, next) {
    var userName = req.params.userName;
    UserModel.getUserByUserName(userName).then(function (user) {
        if (!user) {
            res.statusCode = 404;
            throw new Error("Resource not found");
        }
        res.json(user.toPublicJSON());
    }).catch(function (error) {
        next(error);
    });
});

router.get('/current', app.oauth.authorise(), function (req, res, next) {
    var currentUser = req.oauth.bearerToken.user;
    UserModel.getUserById(currentUser._id).then(function (user) {
        if (!user) {
            res.statusCode = 404;
            throw new Error("Resource not found");
        }
        res.json(user.toPublicJSON());
    }).catch(function (error) {
        next(error);
    });
});

router.put('/update', app.oauth.authorise(), function (req, res, next) {
    var json = UserModel.fromPublicJSON(req.body).toPublicJSON();
    delete json._id;
    delete json.userName;
    json._id = req.user._id;
    UserModel.updateUser(json).then(function (user) {
        if (!user) {
            res.statusCode = 500;
            throw new Error("Error Updating");
        }
        res.json(user.toPublicJSON());
    }).catch(function (error) {
        next(error);
    });
});

router.post('/register', function (req, res, next) {
    var json = Object.assign({}, req.body);
    json.id = null;
    delete json.id;
    var user = UserModel.fromPublicJSON(json);
    user.password = json.password;
    console.log("query %j ", user);
    user.validateUser().then(function () {
        return UserModel.getUserByUserName(user.userName);
    }).then(function (existing) {
        if (existing) {
            var error = new Error("User exists");
            error.code = 409;
            throw error;
        }
        return UserModel.hashPassword(user.password);
    }).then(function (hash) {
        user.password = hash;
        return user.saveNewUser()
    }).then(function (user) {
        res.json(user.toPublicJSON());
    }).catch(function (error) {
        next(error);
    });
});

module.exports = router;
