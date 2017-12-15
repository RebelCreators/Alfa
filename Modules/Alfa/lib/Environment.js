const alfa_env = require("/etc/alfa_env.json");
/**
 * Create an alfa_env.json
 sudo cp alfa_env.json /etc/alfa_env.json

 {
"ALFA_PORT":####,
"ALFA_REDIS_HOST":"####",
"ALFA_REDIS_PORT":####,
"ALFA_SOCKET_PORT":####,
"ALFA_CLIENT_SECRET":"####",
"ALFA_CLIENT_ID":"####",
"ALFA_DB":"####",
"ALFA_CLUSTERING": false
}
 *
 */
for (var key in alfa_env) {
    process.env[key] = alfa_env[key];
}

module.exports = alfa_env;