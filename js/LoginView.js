/// <reference path="3rd/jquery-2.1.0.js" />
/*jslint vars: true, nomen: true*/
/*global jQuery, brite, TalkNow*/

(function ($, TalkNow) {
    'use strict';

    var crypto = require('crypto');
    var md5sum = crypto.createHash('md5');

    brite.registerView("LoginView", { emptyParent: false }, $.extend({}, TalkNow.BaseView, {

        // create the view
        create: function () {
            return TalkNow.render("tmpl-LoginView");
        },

        // postDisplay is great place get the references of the key dom elements
        // and store them in the view for faster access, as it is executed
        // after the view is displayed (async)
        postDisplay: function () {

            var self = this;

            self.$el.modal({
                backdrop: 'static',
                keyboard: false
            }).on('hidden.bs.modal', function () {

                self.$el.bRemove();
            });
            // set up validation
            self.$form = this.$el.find('form');
            self.validator = this.$form.validate();
        },

        close: function () {

            this.$el.modal('hide');
        },

        events: {
            'click; .btn-primary': function (e) {

                var view = this;

                e.preventDefault();

                var btn = $(e.target);

                btn.button('loading');

                view.validator.form();
                var form = view.$form;
                if (view.validator.valid()) {
                    // submit the form
                    var server = form.find('input[name=server]').val();
                    var username = form.find('input[name=username]').val();
                    var password = form.find('input[name=password]').val();
                    TalkNow.logger.debug('server: %s, username: %s, password: %s', server, username, password);

                    md5sum.update(password);
                    password = md5sum.digest('hex');

                    $.post(TalkNow.Config.loginUrl, {
                        account: username,
                        password: password,
                        rememberMe: true
                    }).success(function (data) {
                        if (data.error) {
                            TalkNow.logger.debug('login fail.');
                        } else {
                            TalkNow.logger.debug('login success.');
                            view.$el.trigger('talknow.logined', {userId: String(data.result.userId), server: server});
                        }
                    }).fail(function () {
                        TalkNow.logger.debug('login fail.');
                    });
                }

            }
        },

        daoEvents: {
        }

    }));
}(jQuery, TalkNow));
