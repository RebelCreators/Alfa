const alfa = require('alfa');
const express = require('express');
const app = module.exports = express();
const afimport = require("afimport");
const path = require("path");

alfa(app, afimport.exportModule());