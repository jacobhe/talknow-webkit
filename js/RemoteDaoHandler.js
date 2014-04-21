/*jslint browser: true, devel: true, vars: true, nomen: true */
/*global jQuery, TalkNow*/

(function ($, TalkNow) {
    'use strict';
    /**
     * Create a RemoteDaoHandler type 
     * 
     * @param {String} entityType. create a table for dao with the entity type.
     * @param {String} tableName. create a table for dao with the tableName.
     * @param {String} identity. the primary key of the table.
     * tableDefine. each object for a column in Array, exclude the primary column.
     *                         Example format:
     *                         [{column:'name',dtype:'TEXT'},{column:'email',dtype:'TEXT'},{column:'sex',dtype:'INTEGER'}]
     * 
     */
    function RemoteDaoHandler(entityType) {

        this._entityType = entityType;
        this.path = TalkNow.Config.remoteServer + '/api/' + entityType.toLowerCase();
    }

    // --------- DAO Interface Implementation --------- //

    // --------- DAO Info Methods --------- //
    RemoteDaoHandler.prototype.entityType = function () {

        return this._entityType;
    };
    // --------- DAO Info Methods --------- //


    /**
     * 通过id查找记录
     * @param {Integer} id
     * @return jQuery promise
     */
    RemoteDaoHandler.prototype.get = function (id) {
        return $.getJSON(this.path + '/' + id);
    };

    /**
     * 根据条件检索多个记录
     * @param {Object} opts
     *           opts.page {Number} 页码，从1开始
     *           opts.rows  {Number} 每页显示的记录条数
     *           opts.sidx {String} 排序的列
     *           opts.sord {String} "asc" or "desc"
     * @return jQuery promise
     */
    RemoteDaoHandler.prototype.list = function (opts) {

        return $.getJSON(this.path + (opts ?  '?' + $.param(opts) : ''));
    };


    /**
     * 根据参数的数据创建记录
     *
     * 创建成功后服务器应当返回新创建的记录
     *
     * @param {Object} data 一个json对象
     * @return jQuery promise
     */
    RemoteDaoHandler.prototype.create = function (data) {

        return $.post(this.path, data, 'json');
    };

    /**
     * 更新已经存在的记录
     *
     * 更新成功后，服务器应当返回被更新的记录
     *
     * @param {Integer} id 记录的id
     * @param {Object} data 需要更新的内容
     * @return jQuery promise
     */
    RemoteDaoHandler.prototype.update = function (id, data) {

        return $.ajax({
            type: "PUT",
            url: this.path + '/' + id,
            data: data,
            dataType: 'json'
        });
    };

    /**
     * 根据id删除记录
     *
     * 删除成功后服务器应当返回被删除记录的id
     *
     * @param {Integer} id
     * @return jQuery promise
     */
    RemoteDaoHandler.prototype.remove = function (id) {

        return $.ajax({
            type: "DELETE",
            url: this.path + '/' + id,
            dataType: 'json'
        });
    };

    // -------- Custom Interface Implementation --------- //
    /**
     * 更新多条记录（未完成）
     *
     * The DAO resolve with the ids.
     *
     * @param {Object} opts
     *
     */
    RemoteDaoHandler.prototype.updateMany = function (opts) {

        return $.ajax({
            type: "PUT",
            url: this.path + '/updates',
            data: opts,
            dataType: 'json'
        });
    };

    /**
     * 删除多条记录（未完成）
     *
     * The DAO resolve with the ids.
     *
     * @param {Object} ids
     *
     */
    RemoteDaoHandler.prototype.removeMany = function (opts) {

        return $.ajax({
            type: "DELETE",
            url: this.path + '/deletes',
            data: opts,
            dataType: 'json'
        });
    };

    /**
     * 统计记录的条数
     *
     * 服务器统计成功后应该返回符合下面格式的对象
     *     {count: 100}
     *
     * @param {Object} query 查询条件
     * @return jQuery promise
     */
    RemoteDaoHandler.prototype.count = function (query) {

        return $.getJSON(this.path + '/count', query);
    };

    // -------- /Custom Interface Implementation --------- //

    // --------- /DAO Interface Implementation --------- //
    TalkNow.RemoteDaoHandler = RemoteDaoHandler;

}(jQuery, TalkNow));
