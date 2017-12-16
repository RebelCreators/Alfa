const alfa = require('alfa');
const express = require('express');
const afimport = require("afimport");

alfa.cluster(function (alfa) {
    alfa(express, afimport.exportModule());
});