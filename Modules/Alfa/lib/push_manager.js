var afimport = require("afimport");
var push_config = afimport.require('push_config');
var Mustache = require('mustache');

function PushManager() {

}

PushManager.prototype.push = function(token, message) {

    var config = push_config[message.configName] || push_config["default"];
    if (config) {
        var title = push_config["title"] || "Message";
        var payload = push_config["payload"] || "new message"
        var output = Mustache.render(payload, message);


    }
}

module.exports = new PushManager();