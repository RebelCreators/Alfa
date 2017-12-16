const alfa = require('alfa');
const express = require('express');
const app = module.exports = express();
const afimport = require("afimport");

alfa.cluster(function (alfa) {
    alfa(app, afimport.exportModule());
});