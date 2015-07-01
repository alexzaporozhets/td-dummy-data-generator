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
    password: '780u43o123s',
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
      return library.postCompany(mockUser.token, {name: faker.company.companyName()})
    })
    .then(function (responce) {
      var companyId = responce.data.data.id;
      var results = [];

      var startDate = new Date(new Date(new Date(new Date(new Date().setMinutes(0)).setSeconds(0)).setMilliseconds(0)));

      // 30 days * 24h hours * 60 min * 60 seconds = 14400 chunks per month
      _.range(startDate - 1 * 24 * 60 * 60 * 1000, startDate, 180 * 1000).forEach(function (dateObj) {
        var chunkId = new Date(dateObj).toISOString().substr(0, 17) + '00Z';

        // adding activity
        results.push(
          library.putActivity(mockUser.token, companyId, chunkId, {
            worklog: [
              {
                mode: 'computer',
                start: 0,
                end: 1799
              },
              {
                mode: 'computer',
                start: 3000,
                end: 5999
              }
            ],
            timeuse: [
              {
                app: 'firefox',
                url: 'http://google.com/',
                start: 0,
                end: 500
              },
              {
                app: 'chrome',
                url: 'http://bing.com/',
                start: 501,
                end: 2000
              }
            ]
          })
        );
      });

      return Promise.all(results);
    })
    .then(function (responce) {
      console.log(responce, mockUser)
    })
    .catch(function (responce) {
      console.log('error', responce, mockUser)
    });

});

