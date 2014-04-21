/*jslint browser: true, vars: true, nomen: true*/
/*global jQuery, brite, TalkNow*/

(function ($, TalkNow) {
    'use strict';

    brite.registerView('RosterView', { emptyParent: false }, $.extend({}, TalkNow.BaseView, {

        // create the view
        create: function () {
            return TalkNow.render('tmpl-RosterView');
        },

        init: function () {

            var self = this;

            TalkNow.rosterDao.list().done(function (rosters) {

                self.$el.empty().append(TalkNow.render('tmpl-RosterList', { rosters: rosters }));
            });
        },

        events: {
            'click; a[data-entity=Roster]': function (e) {

                var self = this;

                e.preventDefault();

                var $a = $(e.target);
                // get the contact id from the "data-entity-id" attribute
                var contact = $a.attr('data-entity-id');
                // trigger the action event
                self.$el.trigger('talknow.openchat', { contact: contact });
                // remove active status
                $a.parents('ul').find('li.active').removeClass('active');
                // add active to parent li
                $a.parent('li').addClass('active');

                
                TalkNow.rosterDao.get(contact).then(function (roster) {
                    if (roster) {
                        roster.unreadCount = '';
                        return TalkNow.rosterDao.update(roster);
                    }
                });
            }
        },

        daoEvents: {
            'dataChange; Roster; create': function (e) {

                var self = this;
                var daoEvent = e.daoEvent;
                var roster = daoEvent.result;

                $(TalkNow.render('tmpl-RosterList', { rosters: [roster] })).appendTo(self.$el);
            },

            'dataChange; Roster; update': function (e) {

                var self = this;
                var daoEvent = e.daoEvent;
                var roster = daoEvent.result;

                TalkNow.logger.debug('daoEvent: %j', daoEvent);

                var li = self.$el.find('a[data-entity-id=' + roster.contact + ']').parent('li');
                if (li.hasClass('active')) {
                    roster.active = 'active';
                }
                li.replaceWith(TalkNow.render('tmpl-RosterList', { rosters: [roster] }));
            },

            'dataChange; Roster; remove': function (e) {

                var self = this;
                var daoEvent = e.daoEvent;
                var roster = daoEvent.result;

                self.$el.find('a[data-entity-id=' + roster.contact + ']').parent('li').remove();
            },

            'dataChange; Roster; createAll': function (e) {

                var self = this;
                var daoEvent = e.daoEvent;
                var rosters = daoEvent.result;

                rosters.forEach(function (roster) {
                    $(TalkNow.render('tmpl-RosterList', { rosters: [roster] })).appendTo(self.$el);
                });
            },

            'dataChange; OnlineUser; create': function (e) {

                var self = this;
                var daoEvent = e.daoEvent;
                var user = daoEvent.result;

                self.$el.find('a[data-entity-id=' + user.contact + ']').parent('li').addClass('online');
            },

            'dataChange; OnlineUser; remove': function (e) {

                var self = this;
                var daoEvent = e.daoEvent;
                var user = daoEvent.result;

                self.$el.find('a[data-entity-id=' + user.contact + ']').parent('li').removeClass('online');
            },

            'dataChange; ChatHistory; create': function (e) {

                var view = this;
                var daoEvent = e.daoEvent;
                var message = daoEvent.result;
                var li = view.$el.find('a[data-entity-id=' + message.contact + ']').parent('li');

                if (li.length && !li.hasClass('active')) {
                    TalkNow.rosterDao.get(message.sender).then(function (roster) {
                        if (roster) {
                            roster.unreadCount = (roster.unreadCount || 0) + 1;
                            return TalkNow.rosterDao.update(roster);
                        }
                    });
                }
            }
        }
    }));
}(jQuery, TalkNow));
