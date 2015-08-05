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

  var ownerUser = generateUserIdentity();
  var managedUsers = [];

  // creating a user
  library.register(ownerUser)
    // login
    .then(function () {
      return library.login(ownerUser)
    })
    // add token into headers
    // create a company
    .then(function (responce) {
      // todo: find a better way for it
      ownerUser.token = responce.data.data.token;
      return library.postCompany(ownerUser.token, {name: faker.company.companyName()}).then(function (responce) {
        ownerUser.companyId = responce.data.data.id;
      });
    })
    .then(function (responce) {
      var results = [];

      // inviting users
      _.times(payload.usersAmount, function () {

        var newUser = generateUserIdentity();
        newUser.companyId = ownerUser.companyId;

        results.push(
          library.register(newUser).then(function () {
            return library.postInvitation(ownerUser.token, ownerUser.companyId, newUser).then(function () {
              return library.login(newUser).then(function (responce) {
                // apply token into the user
                newUser.token = responce.data.data.token;
                return newUser;
              });
            })
          }));
      });
      return Promise.all(results);
    })
    .then(function (responce) {
      var results = [];

      // owners activity
      results.push(generateActivity(ownerUser, payload.activityDays));

      // managed activity
      responce.forEach(function (user) {
        results.push(generateActivity(user, payload.activityDays));
      });
      return Promise.all(results);
    })
    .then(function (responce) {
      console.log(ownerUser)
    })
    .catch(function (responce) {
      console.log('error', responce, ownerUser)
    });
});


var getIndexBelowMaxForKey = function(str, max){
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = (hash<<5) + hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
    hash = Math.abs(hash);
  }
  return hash % max;
};

function generateUserIdentity() {
  return {
    name: faker.name.findName(), // Rowan Nikolaus
    password: 'tester',
    email: Date.now() + '-' + process.pid + '-' + faker.internet.email(), // Kassandra.Haley@erich.biz
    device: '3921iepodasdi0aidaospdkaodasdkad'
  }
}


function generateActivity(user, days) {

  var demoChunks = [
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'firefox',
          url: 'google.com',
          start: 0,
          end: 110
        },
        {
          app: 'chrome',
          url: 'youtube.com',
          start: 120,
          end: 140
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'chrome',
          url: 'facebook.com',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'Slack',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'Slack',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'Webstorm',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'Webstorm',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'Webstorm',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'Webstorm',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'computer',
          start: 0,
          end: 180
        }
      ],
      timeuse: [
        {
          app: 'Webstorm',
          start: 0,
          end: 180
        }
      ]
    },
    {
      worklog: [
        {
          mode: 'mobile',
          start: 0,
          end: 180
        }
      ]
    }
  ];

  var results = [];
  // todo: rewrite this crap
  // tomorrow midnight
  var startDate = new Date(new Date(new Date(new Date(new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setMinutes(0)).setSeconds(0)).setMilliseconds(0)).setHours(0)));

  // 30 days * 24h hours * 60 min * 60 seconds = 14400 chunks per month
  _.range(startDate - days * 24 * 60 * 60 * 1000, startDate, 180 * 1000).forEach(function (timestamp) {

    var dateObj = new Date(timestamp);
    var chunkId = dateObj.toISOString().substr(0, 17) + '00Z';

    // todo: refactor
    // + user.name.length % dateObj.getDay()
    var startHour = 8 + getIndexBelowMaxForKey(user.name, dateObj.getDay());
    var finishHour = 18 + getIndexBelowMaxForKey(user.name, dateObj.getDay());
    var rand = user.name.length + getIndexBelowMaxForKey(user.name, dateObj.getDay());

    // work from 8 till 18, random dinner hour using user.name.length
    if (_.inRange(dateObj.getHours(), startHour, finishHour)
      && [rand, rand - 5, rand - 7].indexOf(dateObj.getHours()) === -1
      && (dateObj.getMinutes() > rand || !!(dateObj.getHours() % 2))
      && (dateObj.getMinutes() < (60 - dateObj.getHours()) || !!(dateObj.getHours() % 2)))
    {
      // adding activity
      var randomChunk = _.sample(demoChunks);
      randomChunk.worklogType = "task";

      results.push(library.putActivity(user.token, user.companyId, chunkId, randomChunk));
    }
  });
  return Promise.all(results);
}
