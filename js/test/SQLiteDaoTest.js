/*jslint vars: true, devel: true*/
/*global Handlebars, jQuery, brite, EventEmitter, TalkNow*/

(function () {

    'use strict';

    var create_all_ids = [];

    TalkNow.rosterDao.create({ contact: 'jacob', nickname: 'jacobo' }).then(function (result) {

        console.log('create');
        console.log(result);

        return TalkNow.rosterDao.createAll([{ contact: 'jacob2', nickname: 'jacobo2' }, { contact: 'jacob3', nickname: 'jacobo3' }]);
    }).then(function (results) {

        console.log('create all');
        console.log(results);

        results.forEach(function (data) {
            create_all_ids.push(data.contact);
        });

        return TalkNow.rosterDao.get('jacob');
    }).then(function (result) {

        console.log('get');
        console.log(result);

        return TalkNow.rosterDao.list({ match: { contact: 'jacob' } });
    }).then(function (contacts) {

        console.log('list');
        console.log(contacts);

        return TalkNow.rosterDao.getCount({ match: { contact: 'jacob' } });
    }).then(function (count) {

        console.log('get count');
        console.log(count);

        return TalkNow.rosterDao.update({ contact: 'jacob', nickname: 'jacoboo' });
    }).then(function () {

        console.log('update');

        return TalkNow.rosterDao.list({ equal: { contact: 'jacob' } });
    }).then(function (result) {

        console.log('list');
        console.log(result);

        return TalkNow.rosterDao.remove(result[0].contact);
    }).then(function () {

        console.log('remove');

        return TalkNow.rosterDao.removeAll(create_all_ids);
    }).then(function () {
        console.log('remove all');
    }, function (err) {
        console.log(err);
    });

}());