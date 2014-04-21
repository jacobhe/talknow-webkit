/// <reference path="3rd/socket.io.js" />
/*jslint vars: true, nomen: true*/
/*global jQuery, TalkNow, io, document*/

(function ($, TalkNow, io, document) {

    'use strict';

    function SocketProvider() {

        this.socket = null;
    }

    function trigger(event, data) {

        $(document).trigger(event, data);
    }

    SocketProvider.prototype.connect = function connect(server) {

        var deferred = $.Deferred();

        var self = this;

        var try_alternate = true;

        var socket = io.connect(server);

        // 用户验证失败事件
        socket.on('unauthorized', function () {

            TalkNow.logger.debug('unauthorized');
            deferred.reject('your are not logined');
        });

        // 连接错误事件
        socket.on('connect_failed', function (err) {

            if (!this.socket.connected && try_alternate) {
                try_alternate = false;
                this.socket.options.port = 443;
                this.socket.transports = null;
                this.socket.connect();
                return;
            }
            TalkNow.debug('connect_failed');
            deferred.reject(err);
        });
        // 连接错误事件
        socket.on('error', function (err) {
            TalkNow.debug('connection error');
            deferred.reject(err);
        });

        // 用户成功连接IM服务器，并且已经在线
        socket.on('online', function (resource) {

            self.socket = socket;

            deferred.resolve(resource);

            self.initListeners();
        });

        return deferred.promise();

    };

    SocketProvider.prototype.initListeners = function initListeners() {

        var self = this;

        var socket = self.socket;

        // 服务错误事件
        socket.on('service error', function (type, err) {

            trigger('io.service_error', {type: type, err: err});
        });

        // ping事件
        socket.on('ping', function (ping_id) {

            socket.emit('pong', ping_id);
        });

        // 好友上线事件
        socket.on('available', function (contact, show, status, priority) {

            trigger('io.available', {contact: contact, show: show, status: status, priority: priority});
        });

        // 好友离线事件
        socket.on('unavailable', function (contact) {

            trigger('io.unavailable', {contact: contact});
        });

        // 服务器推送聊天消息
        socket.on('chat', function (contact, message, timestamp, message_id, token, associated_user) {

            trigger('io.chat', {
                contact: contact,
                message: message,
                timestamp: timestamp,
                message_id: message_id,
                token: token,
                associated_user: associated_user
            });
        });

        socket.on('image', function (contact, url, timestamp, message_id, token, associated_user) {

            trigger('io.image', {
                contact: contact,
                message: url,
                timestamp: timestamp,
                message_id: message_id,
                token: token,
                associated_user: associated_user
            });
        });

        socket.on('audio', function (contact, url, duration, timestamp, message_id, token, associated_user) {

            trigger('io.audio', {
                contact: contact,
                message: url,
                duration: duration,
                timestamp: timestamp,
                message_id: message_id,
                token: token,
                associated_user: associated_user
            });

        });

        socket.on('video', function (contact, url, duration, timestamp, message_id, token, associated_user) {

            trigger('io.video', {
                contact: contact,
                message: url,
                duration: duration,
                timestamp: timestamp,
                message_id: message_id,
                token: token,
                associated_user: associated_user
            });
        });

        socket.on('custom message', function (contact, type, param, timestamp, message_id, token, associated_user) {

            trigger('io.custom_message', {
                contact: contact,
                message: type,
                param: param,
                timestamp: timestamp,
                message_id: message_id,
                token: token,
                associated_user: associated_user
            });
        });

        socket.on('product', function (contact, product_id, timestamp, message_id, token, associated_user) {

            trigger('io.product', {
                contact: contact,
                message: product_id,
                timestamp: timestamp,
                message_id: message_id,
                token: token,
                associated_user: associated_user
            });

        });

        socket.on('file', function (contact, file_url, filename, size, timestamp, message_id, token, associated_user) {

            trigger('io.file', {
                contact: contact,
                message: file_url,
                filename: filename,
                size: size,
                timestamp: timestamp,
                message_id: message_id,
                token: token,
                associated_user: associated_user
            });

        });

        socket.on('set roster', function (contact, subscription) {

            trigger('io.set_roster', {
                contact: contact,
                subscription: subscription
            });
        });

    };

    SocketProvider.prototype.queryRoster = function queryRoster() {

        var deferred = $.Deferred();

        this.socket.emit('query roster');

        this.socket.once('roster', function (rosters) {

            TalkNow.logger.debug('queryRoster: %j', rosters);

            deferred.resolve(rosters);
        });

        return deferred.promise();
    };

    SocketProvider.prototype.queryHistory = function queryHistory(search, start, limit, start_date, end_date) {

        var deferred = $.Deferred();

        this.socket.emit('query chat history', search, start, limit, start_date, end_date, function (err, docs, count) {

            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(docs, count);
            }
        });

        return deferred.promise();
    };

    SocketProvider.prototype.queryParticularHistory = function queryParticularHistory(contact, search, start, limit, start_date, end_date) {

        var deferred = $.Deferred();

        this.socket.emit('query particular history', contact, search, start, limit, start_date, end_date, function (err, docs, count) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(docs, count);
            }
        });

        return deferred.promise();
    };

    SocketProvider.prototype.queryHistoryByTimestamp = function queryHistoryByTimestamp(contact, limit, timestamp, type) {

        var deferred = $.Deferred();

        this.socket.emit('query history by timestamp', contact, limit, timestamp, type, function callback(err, docs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(docs);
            }
        });

        return deferred.promise();
    };

    SocketProvider.prototype.queryUnreceivedMessage = function queryUnreceivedMessage(timestamp) {

        var deferred = $.Deferred();

        this.socket.emit('query unreceived message', timestamp, function callback(err, docs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(docs);
            }
        });

        return deferred.promise();
    };

    SocketProvider.prototype.sendChat = function sendChat(contact, message, token) {

        this.socket.emit('chat', contact, message, token);
    };

    TalkNow.SocketProvider = SocketProvider;
}(jQuery, TalkNow, io, document));
