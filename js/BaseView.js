/*jslint vars: true, nomen: true*/
/*global Handlebars, jQuery, brite, EventEmitter, TalkNow*/

(function ($, TalkNow) {

    'use strict';

    TalkNow.BaseView = $.extend({
        close: function () {
            this.$el.bRemove();
        }
    });
}(jQuery, TalkNow));
