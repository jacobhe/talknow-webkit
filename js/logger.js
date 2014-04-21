/*jslint node: true, nomen: true, vars: true*/
'use strict';

var bunyan = require('bunyan');

var path = require('path');

var log_levels = 'debug,info,error';

var streams = [];
log_levels.split(',').forEach(function (level) {
    streams.push({
        level: level,
        path: path.resolve(__dirname, '../logs', level  + '.log')
    });
});

var logger = bunyan.createLogger({
    name: 'talknow',
    streams: streams
});

module.exports = logger;
