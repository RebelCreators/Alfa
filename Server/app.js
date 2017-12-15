const alfa = require('alfa');
const express = require('express');
const app = module.exports = express();
const afimport = require("afimport");
const path = require("path");

//process.env.ALFA_CLUSTERING
alfa.cluster(function (alfa) {
    alfa(app, afimport.exportModule());
});