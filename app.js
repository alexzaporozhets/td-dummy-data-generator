'use strict';

/**
 * https://www.npmjs.com/package/faker
 */
var _ = require('lodash');
var faker = require('faker');
var config = require('./config');
var library = require('./library')(config.apiUrl);

// FIRE
config.companies.forEach(function (payload) {

  var mockUser = {
    name: faker.name.findName(), // Rowan Nikolaus
    password: 'tester',
    email: Date.now() + '-' + process.pid + '-' + faker.internet.email(), // Kassandra.Haley@erich.biz
    device: '3921iepodasdi0aidaospdkaodasdkad'
  };

  // creating a user
  library.register(mockUser)
    // login
    .then(function () {
      return library.login(mockUser)
    })
    // add token into headers
    // create a company
    .then(function (responce) {
      // todo: find a better way for it
      mockUser.token = responce.data.data.token;
      return library.postCompany(mockUser.token, {name: faker.company.companyName()}).then(function (responce) {
        mockUser.companyId = responce.data.data.id;
      });
    })
    .then(function (responce) {
      var results = [];
      // inviting users
      _.times(payload.usersAmount, function () {
        // adding activity
        results.push(library.postInvitation(mockUser.token, mockUser.companyId, {
          name: faker.name.findName(),
          email: Date.now() + '-' + process.pid + '-' + faker.internet.email()
        }));
      });

      return Promise.all(results);
    })
    .then(function (responce) {
      return generateActivity(mockUser, payload.activityDays)
    })
    .then(function (responce) {
      console.log(mockUser)
    })
    .catch(function (responce) {
      console.log('error', responce, mockUser)
    });
});

function generateActivity(user, days) {
  var results = [];
  var startDate = new Date(new Date(new Date(new Date(new Date().setMinutes(0)).setSeconds(0)).setMilliseconds(0)));

  // 30 days * 24h hours * 60 min * 60 seconds = 14400 chunks per month
  _.range(startDate - days * 24 * 60 * 60 * 1000, startDate, 180 * 1000).forEach(function (dateObj) {
    var chunkId = new Date(dateObj).toISOString().substr(0, 17) + '00Z';

    // adding activity
    results.push(
      library.putActivity(user.token, user.companyId, chunkId, {
        worklog: [
          {
            mode: 'computer',
            start: 0,
            end: 110
          },
          {
            mode: 'computer',
            start: 120,
            end: 140
          }
        ],
        timeuse: [
          {
            app: 'firefox',
            url: 'http://google.com/',
            start: 0,
            end: 110
          },
          {
            app: 'chrome',
            url: 'http://bing.com/',
            start: 120,
            end: 140
          }
        ]
      })
    );
  });
  return Promise.all(results);
}