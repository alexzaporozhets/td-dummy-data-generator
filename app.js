'use strict';

/**
 * https://www.npmjs.com/package/faker
 */
var _ = require('lodash');
var faker = require('faker');
var config = require('./config');
var library = require('./library')(config.apiUrl);
var chalk = require('chalk');
var moment = require('moment');

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


// redirect logs from console to the debug.log file
var util = require('util');
var fs = require('fs');
var logFile = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
var logStdout = process.stdout;
console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n'); // log to file
  logStdout.write(util.format.apply(null, arguments) + '\n'); // log to console
};
console.error = console.log;
// /redirect logs from console to the debug.log file

// FIRE
config.companies.forEach(function (payload) {
  var managedUsers = [];

  var workspaceCompanyId = '';

  var ownerUser = {};

  generateUserIdentity()
    .then(function (userIdentity) {
      ownerUser = userIdentity;
    })
    .then(function () {
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
          var promiseSequences = [];
          var userIdentitySequence = Promise.resolve();

          var range = _.range(1, payload.usersAmount, 1);

          // create managed users (register and invite)
          range.forEach(function () {
            var newUser = null;
            userIdentitySequence = new Promise(
              function (innerResolve) {
                generateUserIdentity()
                  .then(function (userIdentity) {
                    newUser = userIdentity;
                    newUser.companyId = workspaceCompanyId;
                  })
                  .then(function () {
                    library
                      .register(newUser)
                      .then(function () {
                        library
                          .postInvitation(ownerUser.token, workspaceCompanyId, newUser)
                          .then(function () {
                            library
                              .login(newUser)
                              .then(function (response) {
                                // apply token into the user
                                newUser.token = response.data.data.token;

                                managedUsers.push(newUser);

                                innerResolve();
                              })
                          });
                      })
                  });
            });

            promiseSequences.push(userIdentitySequence);
          });

          return Promise.all(promiseSequences);
        })
        .then(function () {
          var sequenceUser = Promise.resolve();

          // owners activity
          console.log('generateActivity - ownerUser', ownerUser.email);
          sequenceUser = generateActivity(ownerUser, payload.activityDays, payload.daysForward);

          // managed activity
          managedUsers.forEach(function (user) {
            console.log('generateActivity - user', user.email);
            sequenceUser = sequenceUser.then(function () {
              return generateActivity(user, payload.activityDays, payload.daysForward);
            });
          });

          return sequenceUser;
        })
        .then(function () {
          console.log('ownerUser', ownerUser);
        })
        .catch(function (response) {
          console.log('error', response, ownerUser)
        });
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
  return new Promise(function (resolve) {
    resolve(
      {
        name: faker.name.findName(), // Rowan Nikolaus
        password: 'tester',
        // when emails are with '.dev' domain then mandrill is disabled and this is what we need here :)
        email: Date.now() + '-' + process.pid + '-' + faker.internet.email().replace(/\.\w+$/, '.dev'),
        device: '3921iepodasdi0aidaospdkaodasdkad'
      }
    )
  });
}


function generateActivity(user, activityDays, daysForward) {

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

  var dateForward = moment().add(daysForward, 'days').hours(0).minutes(0).seconds(0).milliseconds(0);

  var timestampFrom = Number(dateForward.unix() - activityDays * 24 * 60 * 60);
  var timestampTo = Number(dateForward.unix());

  var timeRange = _.range(timestampFrom, timestampTo, 180);

  // 30 days * 24h hours * 60 min * 60 seconds = 14400 chunks per month
  var sequence = Promise.resolve();

  var savedActivitiesCount = 0;
  var errorsCount = 0;

  timeRange.forEach(function (timestamp) {
    var dateObj = new Date(timestamp * 1000);
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
      && (dateObj.getMinutes() < (60 - dateObj.getHours()) || !!(dateObj.getHours() % 2))
    ) {
      // adding activity
      var randomChunk = _.sample(demoChunks);
      randomChunk.worklogType = "task";

      sequence = library.putActivity(user.token, user.companyId, chunkId, randomChunk)
        .then(function () {
          savedActivitiesCount++;

          return library.sleep(300);
        })
        .catch(function (err) {
          errorsCount++;

          return library.sleep(300);
        });
    }
  });

  return sequence.then(function () {
    console.log('');
    console.log('************************************************************************************');
    console.log('user', user.name, '| savedActivitiesCount', savedActivitiesCount, ' | errorsCount', errorsCount);
    console.log('************************************************************************************');
    console.log('');

    return library.sleep(1000);
  });
}
