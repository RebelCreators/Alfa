const afimport = require("afimport");
const push_config = afimport.require('push_config');
const Mustache = require('mustache');

function PushManager() {

}

PushManager.prototype.push = function(token, message) {

    const config = push_config[message.configName] || push_config["default"];
    if (config) {
        const title = push_config["title"] || "Message";
        const payload = push_config["payload"] || "new message"
        const output = Mustache.render(payload, message);
    }
}

module.exports = new PushManager();