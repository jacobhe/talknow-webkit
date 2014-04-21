/*jslint browser: true, devel: true, vars: true, nomen: true*/
/*global Handlebars, SCRestricted*/

(function (Handlebars) {
    'use strict';

    /**
     * 控制用户权限的block helper，根据服务器
     * 配置的权限决定是否渲染包含的代码
     */
    Handlebars.registerHelper('security', function (url, options) {

        if (SCRestricted[url]) {
            return '';
        }
        return options.fn(this);
    });

    /**
     * 分页控件，控件所在的context应当具备下面所列的属性
     * rows: 每页现实的行数
     * page: 当前页码
     * records: 记录总数
     */
    Handlebars.registerHelper('pager', function (context, options) {

        options.fn(this);
    });

    /**
     * 自定义的统一样式的按钮，继承了原生按钮的属性
     */
    Handlebars.registerHelper('glbutton', function (context, options) {

        options.fn(this);
    });
}(Handlebars));
