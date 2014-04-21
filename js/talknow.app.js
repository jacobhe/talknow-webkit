/*jslint browser: true, vars: true, nomen: true*/
/*global Handlebars, jQuery, brite, TalkNow*/

(function ($, TalkNow) {

    'use strict';

    // 开发配置，自动加载模板文件
    brite.viewDefaultConfig.loadTmpl = true;

    // 验证控件的全局配置
    $.validator.setDefaults({
        errorPlacement: function (error, element) {
            error.appendTo(element.parents('.text_box'));
        },
        success: function (label) {
            label.remove();
        }
    });

    // --------- Simple Render Wrapper Function ---------- //
    Handlebars.templates = Handlebars.templates || {};

    function render(templateName, data) {
        var tmpl = Handlebars.templates[templateName];
        if (!tmpl) {
            var tmplStr = $("#" + templateName).html();
            tmpl = Handlebars.compile(tmplStr);
            Handlebars.templates[templateName] = tmpl;
        }

        if (tmpl) {
            return tmpl(data);
        }
    }
    // put it in the TalkNow scope
    TalkNow.render = render;

    TalkNow.logger = require('./js/logger');

    var socket = new TalkNow.SocketProvider();

    TalkNow.socket = socket;

    function loadRoster() {
        // 判断是否是第一次运行程序,如果是就从服务器加载联系人列表
        TalkNow.configDao.list({equal: {name: 'loadroster'}}).done(function (configs) {

            TalkNow.logger.debug('load configs: %j', configs);

            var config = configs[0];

            if (!config) {
                config = {
                    name: 'loadroster',
                    value: 'false'
                };
            }

            if (config.value === 'false') {
                socket.queryRoster().then(function (rosters) {
                    return TalkNow.rosterDao.createAll(rosters);
                }).then(function () {
                    config.value = 'true';
                    if (config.id) {
                        return TalkNow.configDao.update(config);
                    }
                    return TalkNow.configDao.create(config);
                }).then(function () {
                    return TalkNow.rosterDao.list();
                }).then(function (rosters) {
                    var userIds = rosters.map(function (roster) {
                        return roster.contact;
                    });
                    loadUsers(userIds);
                });
            }
        });
    }

    function loadUsers(userIds) {

        var ids = userIds.splice(0, 200);

        $.post(TalkNow.Config.namecardUrl, $.param({
            userIds: ids
        }, true)).success(function (data) {
            if (!data.error) {
                data.result.forEach(function (user) {

                    var image = user.image || '';
                    var is_group = /^group/.test(image);
                    var is_attachment = /^attachment/.test(image);
                    var server = is_attachment ? 'http://newimg.globalmarket.com/filestorage/' : 'http://newimg.globalmarket.com/scale/pic=';

                    if (!user.image) {
                        user.image = 'http://newimg.globalmarket.com/scale/pic=gmsns/0/0/0/photo/avatar_male_m.png';
                    } else if (is_attachment) {
                        user.image = server + image;
                    } else {
                        user.image = server + image.replace(/(\.\w+)$/, (is_group ? '_x_30x30$1' : '_s$1'));
                    }
                    user.contact = user.userId;
                    delete user.userId;
                    TalkNow.rosterDao.update(user);
                });
            }
        }).always(function () {
            if (userIds.length) {
                loadUsers(userIds);
            }
        });
    }

    brite.display('LoginView', '.container').done(function (view) {

        $(document).on('talknow.logined', function (e, data) {
            socket.connect(data.server).then(function () {

                TalkNow.logger.debug('im server connected');

                view.close();

                // load roster
                loadRoster();

                // display main view
                brite.display('MainView', '.container', data.userId);

            }, function (err) {

                TalkNow.logger.error(err);
            });
        });
    });

}(jQuery, TalkNow));
