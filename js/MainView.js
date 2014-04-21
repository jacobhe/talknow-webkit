/*jslint vars: true, nomen: true*/
/*global jQuery, brite, TalkNow*/

(function ($, TalkNow) {
    'use strict';

    function generateHistory(data, user_id) {

        var history = {
            id: data.message_id,
            message: data.message,
            sender: data.contact,
            receiver: data.associated_user,
            type: '',
            duration: 0,
            status: 1,
            timestamp: data.timestamp,
            filename: '',
            size: 0,
            contact: data.contact === user_id ? data.associated_user : data.contact
        };

        return history;
    }

    brite.registerView("MainView", $.extend({}, TalkNow.BaseView, {

        // create the view
        create: function (user_id) {

            TalkNow.logger.debug('user_id: %s', user_id);

            this.user_id = user_id;
            return TalkNow.render("tmpl-MainView");
        },

        // postDisplay is great place get the references of the key dom elements
        // and store them in the view for faster access, as it is executed
        // after the view is displayed (async)
        postDisplay: function () {

            brite.display('RosterView', '.sidebar');
        },

        docEvents: {
            'talknow.openchat': function (e, contact) {
                brite.display('ChatView', '.chat-area', contact);
            },

            'io.service_error': function (e, data) {
            },

            'io.available': function (e, data) {

            },

            'io.unavailable': function (e, data) {
            },

            'io.chat': function (e, data) {

                TalkNow.logger.debug('chat: %j', data);

                var self = this;
                var history = $.extend(generateHistory(data, self.user_id), {
                    type: 'chat',
                });

                TalkNow.chatHistoryDao.create(history);
            },

            'io.image': function (e, data) {

                var self = this;
                var history = $.extend(generateHistory(data, self.user_id), {
                    type: 'image',
                });

                TalkNow.chatHistoryDao.create(history);
            },

            'io.audio': function (e, data) {

                var self = this;
                var history = $.extend(generateHistory(data, self.user_id), {
                    type: 'audio',
                    duration: data.duration
                });

                TalkNow.chatHistoryDao.create(history);
            },

            'io.video': function (e, data) {

                var self = this;
                var history = $.extend(generateHistory(data, self.user_id), {
                    type: 'video',
                    duration: data.duration
                });

                TalkNow.chatHistoryDao.create(history);
            },

            'io.custom_message': function (e, data) {

                var self = this;
                var history = $.extend(generateHistory(data, self.user_id), {
                    type: 'custom',
                    param: data.param
                });

                TalkNow.chatHistoryDao.create(history);
            },

            'io.product': function (e, data) {

                var self = this;
                var history = $.extend(generateHistory(data, self.user_id), {
                    type: 'product',
                });

                TalkNow.chatHistoryDao.create(history);
            },

            'io.file': function (e, data) {

                var self = this;
                var history = $.extend(generateHistory(data, self.user_id), {
                    type: 'file',
                    filename: data.filename,
                    size: data.size
                });

                TalkNow.chatHistoryDao.create(history);
            },

            'io.set_roster': function (e, data) {
            },

            'message.chat': function (e, data) {

                TalkNow.logger.debug('send chat: %j', data);
                TalkNow.socket.sendChat(data.contact, data.message, '');
            }

        },

        daoEvents: {
        }

    }));
}(jQuery, TalkNow));
