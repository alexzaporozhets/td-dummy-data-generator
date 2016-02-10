'use strict';

/**
 * https://www.npmjs.com/package/faker
 */
var _ = require('lodash');
var faker = require('faker');
var config = require('./config');
var library = require('./library')(config.apiUrl);
var chalk = require('chalk');

/**
 * confirm API url
 * @type {getYesNo}
 */
var query = require('cli-interact').getYesNo;
var answer = query('current API url: ' + chalk.yellow(config.apiUrl) + ' - do you want to proceed?');
if (!answer) {
  console.log('ok, so please use TD_API_URL env parameter to set the API url you need');
  console.log('bye :)');
  process.exit();
}

console.log('\nok, so dummy data will be generated for ' + chalk.green(config.apiUrl) + '\n');

// FIRE
config.companies.forEach(function (payload) {

  var ownerUser = generateUserIdentity();
  var managedUsers = [];

  var workspaceCompanyId = '';

  // creating a user
  library.register(ownerUser)
    // login
    .then(function () {
      return library.login(ownerUser)
    })
    // add token into headers
    // create MAIN company
    .then(function (response) {
      // todo: find a better way for it
      ownerUser.token = response.data.data.token;
      return library
        .postCompany(ownerUser.token, { name: faker.company.companyName() })
        .then(function (response) {
          ownerUser.companyId = response.data.data.id;
        });
    })
    .then(function () {
      /**
       * having main/root company, we can create first child company
       * which will be also the first workspace
       * and is needed to assign/invite users to it :)
       * (main company is not workspace - it is only root - do not assign any employee to it!!)
       */

      return library
        .postCompany(ownerUser.token, { name: ownerUser.name + 'workspace 1' }, ownerUser.companyId)
        .then(function (response) {
          workspaceCompanyId = response.data.data.id;
        });
    })
    .then(function () {
      var results = [];

      // let's invite people
      _.times(payload.usersAmount, function () {

        var newUser = generateUserIdentity();
        newUser.companyId = workspaceCompanyId;

        results.push(
          library.register(newUser).then(function () {
            return library.postInvitation(ownerUser.token, workspaceCompanyId, newUser).then(function () {
              return library.login(newUser).then(function (response) {
                // apply token into the user
                newUser.token = response.data.data.token;
                return newUser;
              });
            })
          }));
      });
      return Promise.all(results);
    })
    .then(function (response) {

      // owners activity
      console.log('generateActivity - ownerUser', ownerUser.email);
      var results = generateActivity(ownerUser, payload.activityDays);

      // managed activity
      response.forEach(function (user) {
        console.log('generateActivity - user', user.email);
        results.then(generateActivity(user, payload.activityDays));
      });
      return results;
    })
    .then(function () {
      console.log(ownerUser);
    })
    .catch(function (response) {
      console.log('error', response, ownerUser)
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

  var results = Promise.resolve();
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

      results.then(library.putActivity(user.token, user.companyId, chunkId, randomChunk));
    }
  });
  return results;
}
