const alfa = require('alfa');
const express = require('express');
const afimport = require("afimport");

//alfa.cluster(function (alfa) {
    afimport.importModule(alfa(express, afimport.exportModule()));
    const PushConfig = afimport.require('push_config');
    PushConfig.setConfigForName("serverMessage", {
        "alert": "{{to.userName}} {{message.extras.desc}}",
        "sound": "default"
    });
//});
