/* This is experimental code made for example and to be taken and customize. 
 * API and implementation of this component can change at anytime, so the best course 
 * is to test it, and make it your own (by change the name space) if you decide to use it.
 */

/*jslint vars: true, nomen: true*/
/*global jQuery, TalkNow, require, document*/

(function ($, TalkNow) {

    'use strict';

    var sqlite3 = require('sqlite3').verbose();
    var path = require('path');

    var SQLiteDB = new sqlite3.Database(path.join(require('nw.gui').App.dataPath, 'talknow.db'));

    //process.on('exit', function () {
    //    SQLiteDB.close();
    //});
    document.addEventListener('unload', function () {
        SQLiteDB.close();
    });

    /**
     * Create a SQLiteDaoHandler type 
     * 
     * @param {String} entityType. create a table for dao with the entity type.
     * @param {String} tableName. create a table for dao with the tableName.
     * @param {String} identity. the primary key of the table.
     * @param {Array.Object} tableDefine. each object for a column in Array, exclude the primary column.
     *             Example format:
     *             [{column:'name',dtype:'TEXT'},{column:'email',dtype:'TEXT'},{column:'sex',dtype:'INTEGER'}]
     * 
     */
    function SQLiteDaoHandler(entityType, tableName, identity, tableDefine) {

        this._entityType = entityType;
        this._tableName = tableName;
        this._tableDefine = $.extend([], tableDefine);

        if (identity) {
            this._identity = identity;
        } else {
            this._identity = 'id';
            this._tableDefine.push({ column: 'id', dtype: 'INTEGER', autoincrement: true });
        }

        var self = this;
        var sql = [];
        var columns = [];

        self._tableDefine.forEach(function (def) {

            if (def.column === self._identity) {
                if (def.autoincrement) {
                    columns.push(def.column + ' ' + def.dtype + ' PRIMARY KEY AUTOINCREMENT NOT NULL');
                } else {
                    columns.push(def.column + ' ' + def.dtype + ' PRIMARY KEY');
                }
            } else {
                columns.push(def.column + ' ' + def.dtype);
            }
        });

        sql.push('CREATE TABLE IF NOT EXISTS');
        sql.push(tableName);
        sql.push('(');
        sql.push(columns.join(','));
        sql.push(')');

        SQLiteDB.serialize(function () {

            SQLiteDB.run(sql.join(' '));
            SQLiteDB.run('CREATE UNIQUE INDEX IF NOT EXISTS ' + tableName + '_' + self._identity + ' ON '
                + tableName + '(' + self._identity + ')');
        });
    }

    // --------- DAO Interface Implementation --------- //
    /**
     * DAO Interface: Return the property ID name
     * @return the id (this is not deferred), default value is "id"
     * @throws error if dao cannot be found
     */
    SQLiteDaoHandler.prototype.getIdName = function () {
        return this._identity;
    };

    // --------- DAO Info Methods --------- //
    SQLiteDaoHandler.prototype.entityType = function () {
        return this._entityType;
    };
    // --------- DAO Info Methods --------- //


    /**
     * DAO Interface: Return a deferred object for this id.
     * @param {Integer} id
     * @return
     */
    SQLiteDaoHandler.prototype.get = function (id) {

        var dao = this;
        var dfd = $.Deferred();
        var sql;

        if (id) {
            sql = "SELECT * FROM " + dao._tableName + " where "
                    + dao.getIdName() + "= ?";
            SQLiteDB.get(sql, id, function (err, row) {

                if (err) {
                    dfd.reject(err);
                    return;
                }

                dfd.resolve(row);
            });
        } else {
            dfd.resolve(null);
        }

        return dfd.promise();
    };


    /**
     * DAO Interface: Return a deferred object for this options
     * @param {Object} opts 
     *           opts.pageIndex {Number} Index of the page, starting at 0.
     *           opts.pageSize  {Number} Size of the page
     *           opts.match     {Object} add condition with expr 'like' in the where clause.
     *           opts.equal     {Object} add condition with expr '=' in the where clause.
     *           opts.ids         {Array}  add condition with expr ' id in (...)' in the where clause.
     *           opts.orderBy   {String}
     *           opts.orderType {String} "asc" or "desc"
     */
    SQLiteDaoHandler.prototype.list = function (opts) {
        var dao = this;

        var dfd = $.Deferred();
        var condition = "";
        var filters;
        var i;
        var ids;

        if (opts) {
            if (opts.match) {
                filters = opts.match;
                Object.getOwnPropertyNames(filters).forEach(function (k) {
                    condition += " and " + k + " like '%" + filters[k] + "%'";
                });
            }

            if (opts.equal) {
                filters = opts.equal;
                Object.getOwnPropertyNames(filters).forEach(function (k) {
                    condition += " and " + k + "='" + filters[k] + "'";
                });
            }


            if (opts.ids && $.isArray(opts.ids)) {
                ids = opts.ids;
                condition += dao.getIdName() + " and in (";
                for (i = 0; i < ids.length; i += 1) {
                    condition += "'" + ids[i] + "'";
                    if (i !== ids.length - 1) {
                        condition += ",";
                    }
                }
                condition += ")";
            }

            if (opts.orderBy) {
                condition += " order by " + opts.orderBy;
                if (opts.orderType) {
                    condition += " " + opts.orderType;
                }
            }

            if (opts.pageIndex || opts.pageIndex === 0) {
                condition += " limit " + (opts.pageIndex * opts.pageSize);
                if (opts.pageSize) {
                    condition += "," + opts.pageSize;
                } else {
                    condition += ", -1";
                }
            }
        }


        var listSql = "SELECT " + " * " + "FROM " + dao._tableName + " where 1=1 " + condition;
        SQLiteDB.all(listSql, function (err, rows) {
            if (err) {
                dfd.reject(err);
                return;
            }
            dfd.resolve(rows);
        });

        return dfd.promise();
    };


    /**
     * DAO Interface: Create a new instance of the object for a give  data. <br />
     *
     * The DAO resolve with the newly created data.
     *
     * @param {Object} data
     */
    SQLiteDaoHandler.prototype.create = function (data) {


        var self = this;
        var dfd = $.Deferred();
        var sql = [];
        var columns = [];
        var marks = [];

        self._tableDefine.forEach(function (def) {
            if (!def.autoincrement) {
                columns.push(def.column);
                marks.push('?');
            }
        });

        sql.push("INSERT INTO " + self._tableName + " (");
        sql.push(columns.join(','));
        sql.push(') VALUES (');
        sql.push(marks.join(','));
        sql.push(')');

        var params = [];
        columns.forEach(function (name) {
            params.push(data[name] || '');
        });

        SQLiteDB.run(sql.join(' '), params, function callback(err) {

            if (err) {
                dfd.reject(err);
                return;
            }
            var o = {};
            o[self.getIdName()] = this.lastID;

            dfd.resolve($.extend(o, data));
        });

        return dfd.promise();

    };

    /**
     * DAO Interface: update a existing id with a set of property/value data.
     *
     * The DAO resolve with the updated data.
     *
     * @param {Integer} id
     * @param {Object} data
     */
    SQLiteDaoHandler.prototype.update = function (data) {

        var self = this;
        var dfd = $.Deferred();
        var sql = [];
        var columns = [];
        var marks = [];

        self._tableDefine.forEach(function (def) {
            // exclude id field
            if (def.column !== self.getIdName()) {
                columns.push(def.column);
            }
        });

        var params = [];

        columns.forEach(function (name) {
            if (name in data) {
                marks.push(name + '=?');
                params.push(data[name] || '');
            }
        });
        params.push(data[self.getIdName()]);

        sql.push("UPDATE " + self._tableName + " set");
        sql.push(marks.join(','));
        sql.push("where " + self.getIdName() + "= ?");


        SQLiteDB.run(sql.join(' '), params, function callback(err) {

            if (err) {
                dfd.reject(err);
                return;
            }

            dfd.resolve(data);
        });

        return dfd.promise();

    };

    /**
     * DAO Interface: remove an instance of objectType for a given  id.
     *
     * The DAO resolve with the id.
     * 
     * @param {Integer} id
     * 
     */
    SQLiteDaoHandler.prototype.remove = function (id) {

        var dao = this;
        var dfd = $.Deferred();
        var delSql = "DELETE FROM " + dao._tableName + " where " + dao.getIdName() + "= ?";

        if (id) {
            SQLiteDB.run(delSql, [id], function (err) {

                if (err) {
                    dfd.reject(err);
                    return;
                }
                dfd.resolve(id);
            });
        } else {
            dfd.resolve(null);
        }

        return dfd.promise();

    };

    // -------- Custom Interface Implementation --------- //
    /**
     * DAO Interface: remove an instance of objectType for a given ids.
     *
     * The DAO resolve with the ids.
     * 
     * @param {Array} ids
     * 
     */
    SQLiteDaoHandler.prototype.removeAll = function (ids) {

        var self = this;
        var dfd = $.Deferred();
        var delSql = "DELETE FROM " + self._tableName + " where " + self.getIdName() + "= ?";

        SQLiteDB.serialize(function () {

            var stmt = SQLiteDB.prepare(delSql);
            var count = 0;
            var rejected = false;

            ids.forEach(function (id) {

                if (!id) {
                    count += 1;
                    return;
                }

                stmt.run(id, function callback(err) {

                    if (rejected) {
                        return;
                    }
                    if (err) {
                        rejected = true;
                        dfd.reject(err);
                        return;
                    }
                    count += 1;
                    if (count === ids.length) {
                        dfd.resolve(ids);
                    }
                });

            });

            stmt.finalize();
        });

        return dfd.promise();

    };

    SQLiteDaoHandler.prototype.removeAllRecord = function () {

        var self = this;
        var dfd = $.Deferred();

        var delSql = "DELETE * FROM " + self._tableName;

        SQLiteDB.run(delSql, function (err) {

            if (err) {
                dfd.reject(err);
                return;
            }
            dfd.resolve();
        });

        return dfd.promise();
    };

    /**
     * DAO Interface: Create instances of the object for a give objs. <br />
     *
     * The DAO resolve with the newly created data.
     *
     * @param {Array} array of data
     */
    SQLiteDaoHandler.prototype.createAll = function (objs) {

        var self = this;
        var dfd = $.Deferred();
        var sql = [];
        var columns = [];
        var marks = [];

        self._tableDefine.forEach(function (def) {
            if (!def.autoincrement) {
                columns.push(def.column);
                marks.push('?');
            }
        });

        sql.push("INSERT INTO " + self._tableName + " (");
        sql.push(columns.join(','));
        sql.push(') VALUES (');
        sql.push(marks.join(','));
        sql.push(')');

        SQLiteDB.serialize(function () {

            var stmt = SQLiteDB.prepare(sql.join(' '));
            var count = 0;
            var rejected = false;
            var returnArray = [];

            objs.forEach(function (obj, i) {

                var params = [];
                columns.forEach(function (name) {
                    params.push(obj[name] || '');
                });

                stmt.run(params, function callback(err) {

                    if (rejected) {
                        return;
                    }

                    if (err) {
                        rejected = true;
                        dfd.reject(err);
                        return;
                    }
                    count += 1;
                    var o = {};
                    o[self.getIdName()] = this.lastID;
                    returnArray[i] = $.extend(o, obj);
                    if (count === objs.length) {
                        dfd.resolve(returnArray);
                    }
                });
            });

            stmt.finalize();
        });

        return dfd.promise();
    };

    /**
     * DAO Interface: update instances of the object for a give objs. <br />
     *
     * The DAO resolve with the newly updated data.
     *
     * @param {Array} array of data
     */
    SQLiteDaoHandler.prototype.updateAll = function (objs) {

        var self = this;
        var dfd = $.Deferred();
        var sql = [];
        var columns = [];
        var marks = [];

        self._tableDefine.forEach(function (def) {
            // exclude id field
            if (def.column !== self.getIdName()) {
                columns.push(def.column);
                marks.push(def.column + '=?');
            }
        });

        sql.push("UPDATE " + self._tableName + " set");
        sql.push(marks.join(','));
        sql.push("where " + self.getIdName() + "= ?");

        SQLiteDB.serialize(function () {

            var stmt = SQLiteDB.prepare(sql.join(' '));
            var count = 0;
            var rejected = false;
            var returnArray = [];

            objs.forEach(function (obj, i) {

                var params = [];
                columns.forEach(function (name) {
                    params.push(obj[name] || '');
                });
                params.push(obj[self.getIdName()]);

                stmt.run(params, function callback(err) {

                    if (rejected) {
                        return;
                    }

                    if (err) {
                        rejected = true;
                        dfd.reject(err);
                        return;
                    }
                    count += 1;
                    returnArray[i] = $.extend({}, obj);
                    if (count === objs.length) {
                        dfd.resolve(returnArray);
                    }
                });
            });

            stmt.finalize();
        });

        return dfd.promise();
    };

    /**
     * DAO Interface: Return a deferred object for this  options
     * @param {Object} opts 
     *           opts.match     {Object} add condition with expr 'like' in the where clause.
     *           opts.equal     {Object} add condition with expr '=' in the where clause.
     *           opts.ids         {Array}  add condition with expr ' id in (...)' in the where clause.
     */
    SQLiteDaoHandler.prototype.getCount = function (opts) {
        var dao = this;

        var dfd = $.Deferred();
        var condition = "";
        var filters;
        var ids;
        var i;

        if (opts) {
            if (opts.match) {
                filters = opts.match;
                Object.getOwnPropertyNames(filters).forEach(function (k) {
                    condition += " and " + k + " like '%" + filters[k] + "%'";
                });
            }

            if (opts.equal) {
                filters = opts.equal;
                Object.getOwnPropertyNames(filters).forEach(function (k) {
                    condition += " and " + k + "='" + filters[k] + "'";
                });
            }

            if (opts.ids && $.isArray(opts.ids)) {
                ids = opts.ids;
                condition += dao.getIdName() + " and in (";
                for (i = 0; i < ids.length; i += 1) {
                    condition += "'" + ids[i] + "'";
                    if (i !== ids.length - 1) {
                        condition += ",";
                    }
                }
                condition += ")";
            }

        }


        var listSql = "SELECT " + "count(*) as 'count' " + "FROM " + dao._tableName + " where 1=1 " + condition;
        SQLiteDB.get(listSql, function (err, row) {
            if (err) {
                dfd.reject(err);
                return;
            }
            dfd.resolve(row.count);
        });

        return dfd.promise();
    };

    // -------- /Custom Interface Implementation --------- //

    // --------- /DAO Interface Implementation --------- //
    TalkNow.SQLiteDaoHandler = SQLiteDaoHandler;

}(jQuery, TalkNow));
