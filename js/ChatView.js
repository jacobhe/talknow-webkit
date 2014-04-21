/*jslint vars: true, nomen: true*/
/*global jQuery, brite, TalkNow*/

(function ($, TalkNow) {
    'use strict';

    brite.registerView('ChatView', { emptyParent: true }, $.extend({}, TalkNow.BaseView, {

        // create the view
        create: function (contact) {

            var view = this;

            return TalkNow.rosterDao.get(contact.contact).then(function (user) {

                TalkNow.logger.debug('contact: %j', user);

                view.$contact = user;
                return TalkNow.render('tmpl-ChatView', user);
            });
        },

        init: function () {

            var view = this;

            view.$textarea = view.$el.find('textarea');
            view.$chat_messages = view.$el.find('.chat-messages');

            // 加载10条聊天记录
            return TalkNow.chatHistoryDao.list({
                equal: {
                    contact: view.$contact.contact
                },
                pageIndex: 0,
                pageSize: 10,
                orderBy: 'timestamp',
                orderType: 'desc'
            }).then(function (messages) {
                messages.reverse();
                messages.forEach(function (message) {
                    view.$chat_messages.append(TalkNow.render('tmpl-ChatMessage', message));
                });
            });

        },

        // postDisplay is great place get the references of the key dom elements
        // and store them in the view for faster access, as it is executed
        // after the view is displayed (async)
        postDisplay: function () {

            var view = this;

            view.$chat_messages.mCustomScrollbar({
                theme: 'light',
                set_height: view.$el.find('.main').height() - 90
            });
            view.$chat_messages.mCustomScrollbar('scrollTo', 'bottom');
        },

        events: {
            'click; .btn-primary': function (e) {

                var view = this;
                var message = view.$textarea.val();

                TalkNow.logger.debug('send button click: %s, %s ', view.$contact.contact, message);
                if (message) {
                    view.$el.trigger('message.chat', { contact: view.$contact.contact, message: message });
                    view.$textarea.val('');
                }
            }
        },

        daoEvents: {
            'dataChange; ChatHistory; create': function (e) {

                var daoEvent = e.daoEvent;
                var message = daoEvent.result;
                var view = this;

                if (message.contact === view.$contact.contact) {
                    view.$chat_messages.find('.mCSB_container').append(TalkNow.render('tmpl-ChatMessage', message));
                    view.$chat_messages.mCustomScrollbar('update');
                    view.$chat_messages.mCustomScrollbar('scrollTo', 'bottom');
                }
            }
        }

    }));
}(jQuery, TalkNow));
