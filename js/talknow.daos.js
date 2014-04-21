/*jslint browser: true, devel: true, vars: true, nomen: true*/
/*global brite, TalkNow*/

/**
 * 注册所有的dao
 */

/**
 * 联系人DAO
 */
TalkNow.rosterDao = brite.registerDao(new TalkNow.SQLiteDaoHandler('Roster', 'Roster', 'contact', [
    { column: 'contact', dtype: 'TEXT' },
    { column: 'followNum', dtype: 'INTEGER' },
    { column: 'gmc', dtype: 'TEXT' },
    { column: 'serverYear', dtype: 'INTEGER' },
    { column: 'gmcName', dtype: 'TEXT' },
    { column: 'isBuyer', dtype: 'TEXT' },
    { column: 'nickName', dtype: 'TEXT' },
    { column: 'compId', dtype: 'INTEGER' },
    { column: 'compCountryId', dtype: 'INTEGER' },
    { column: 'beFollowNum', dtype: 'INTEGER' },
    { column: 'image', dtype: 'TEXT' },
    { column: 'compName', dtype: 'TEXT' },
    { column: 'isOffice', dtype: 'TEXT' },
    { column: 'familyName', dtype: 'TEXT' },
    { column: 'givenName', dtype: 'TEXT' },
    { column: 'compCountryName', dtype: 'TEXT' },
    { column: 'isSeller', dtype: 'TEXT' },
    { column: 'loaded', dtype: 'INTEGER' },
    { column: 'unreadCount', dtype: 'INTEGER' }
]));

/**
 * 聊天历史记录
 */
TalkNow.chatHistoryDao = brite.registerDao(new TalkNow.SQLiteDaoHandler('ChatHistory', 'ChatHistory', 'id', [
    { column: 'id', dtype: 'TEXT' },
    { column: 'sender', dtype: 'TEXT' },
    { column: 'receiver', dtype: 'TEXT' },
    { column: 'type', dtype: 'TEXT' },
    { column: 'duration', dtype: 'INTEGER' },
    { column: 'message', dtype: 'TEXT' },
    { column: 'status', dtype: 'INTEGER' },
    { column: 'timestamp', dtype: 'TEXT' },
    { column: 'filename', dtype: 'TEXT' },
    { column: 'param', dtype: 'TEXT' },
    { column: 'size', dtype: 'INTEGER' },
    { column: 'contact', dtype: 'TEXT'}
]));

/**
 * 应用配置
 */
TalkNow.configDao = brite.registerDao(new TalkNow.SQLiteDaoHandler('Config', 'Config', '', [
    { column: 'name', dtype: 'TEXT' },
    { column: 'value', dtype: 'TEXT' },
]));

TalkNow.onlineUserDao = brite.registerDao(new TalkNow.SQLiteDaoHandler('OnlineUser', 'OnlineUser', 'contact', [
    { column: 'contact', dtype: 'TEXT' },
    { column: 'status', dtype: 'TEXT' },
]));
