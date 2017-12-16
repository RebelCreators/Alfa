const path = require("path");
const os = require('os');

const alfa_env = require(path.resolve(os.homedir()) + path.sep + ".env/alfa.json");
/**
 * Create an alfa_env.json
 sudo cp alfa_env.json /etc/alfa_env.json

 {
"ALFA_PORT":####,
"ALFA_REDIS_HOST":"#############",
"ALFA_REDIS_PORT":####,
"ALFA_SOCKET_PORT":####,
"ALFA_CLIENT_SECRET":"###########",
"ALFA_CLIENT_ID":"########",
"ALFA_DB":"###########",
"DEBUG": "Alfa:*"
}
 *
 */
for (var key in alfa_env) {
    process.env[key] = alfa_env[key];
}

/*!
 *
 * Module Exports
 */
module.exports = alfa_env;