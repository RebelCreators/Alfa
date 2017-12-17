const afimport = require("afimport");
const router = afimport.require("ExpressRouter", {
    namespace: "com.rebelcreators.Router"
})();
const app = afimport.require('app', {
    namespace: "com.rebelcreators.app"
});
const UserModel = afimport.require("User");
const logger = afimport.require("logger");

router.get('/', function (req, res, next) {
    res.json({error: "resouce needed"});
});

/**
 * GET /:userId/id
 * response {UserModel}
 */
router.get('/:userId/id', app.oauth.authorise(), function (req, res, next) {
    try {
        const userId = req.params.userId;
        UserModel.getUserById(userId).then(function (user) {
            if (!user) {
                res.statusCode = 404;
                throw new Error("Resource not found");
            }

            res.json(user.toJSON());
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

/**
 * GET /id
 * query userIDs {Array.<string>}
 * response {Array.<UserModel>}
 */
router.get('/id', app.oauth.authorise(), function (req, res, next) {
    try {
        const userIds = req.query.userIDs;
        UserModel.getUsersByIds(userIds).then(function (users) {
            var u = []
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                u.push(user.toJSON())
            }
            res.json(u);
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

/**
 * GET /username
 * query userNames {Array.<string>}
 * response {Array.<UserModel>}
 */
router.get('/username', app.oauth.authorise(), function (req, res, next) {
    try {
        const usernames = req.query.userNames;
        UserModel.getUsersByUserNames(usernames).then(function (users) {
            var u = []
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                u.push(user.toJSON())
            }
            res.json(u);
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

/**
 * GET /:userName/username
 * response {UserModel}
 */
router.get('/:userName/username', app.oauth.authorise(), function (req, res, next) {
    try {
        const userName = req.params.userName;
        UserModel.getUserByUserName(userName).then(function (user) {
            if (!user) {
                res.statusCode = 404;
                throw new Error("Resource not found");
            }
            res.json(user.toJSON());
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

/**
 * GET /current
 * response {UserModel}
 */
router.get('/current', app.oauth.authorise(), function (req, res, next) {
    try {
        const currentUser = req.oauth.bearerToken.user;
        UserModel.getUserById(currentUser._id).then(function (user) {
            if (!user) {
                res.statusCode = 404;
                throw new Error("Resource not found");
            }
            res.json(user.toJSON());
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

/**
 * PUT /update
 * body userModel {UserModel}
 * response {UserModel}
 */
router.put('/update', app.oauth.authorise(), function (req, res, next) {
    try {
        var json = UserModel.fromPublicJSON(req.body).toJSON();
        delete json._id;
        delete json.userName;
        json._id = req.user._id;
        UserModel.updateUser(json).then(function (user) {
            if (!user) {
                res.statusCode = 500;
                throw new Error("Error Updating");
            }
            res.json(user.toJSON());
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

/**
 * PUT /register
 * body userModel {UserModel}
 * response {UserModel}
 */
router.post('/register', function (req, res, next) {
    try {
        var json = Object.assign({}, req.body);
        json.id = null;
        delete json.id;
        const user = UserModel.fromPublicJSON(json);
        user.password = json.password;
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
            res.json(user.toJSON());
        }).catch(function (error) {
            next(error);
        });
    } catch (error) {
        logger.error("" + error);
        res.statusCode = 500;
        next(new Error("Internal Error"));
    }
});

module.exports = router;
