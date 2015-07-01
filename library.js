var axios = require('axios');
var apiUrl = '';

module.exports = function (url) {
  // set global url for API
  apiUrl = url;

  return {
    register: register,
    login: login,
    postCompany: postCompany,
    putActivity: putActivity
  }
};

/**
 *
 * @param data
 * @returns {axios.Promise}
 */
function register(data) {
  return axios.post(apiUrl + '/register', data);
}

/**
 *
 * @param data
 * @returns {axios.Promise}
 */
function login(data) {
  return axios.post(apiUrl + '/login', data);
}

/**
 *
 * @param token
 * @param data
 * @returns {axios.Promise}
 */
function postCompany(token, data) {
  return axios.post(apiUrl + '/companies', data, {headers: {Authorization: 'JWT ' + token}});
}

/**
 *
 * @param token
 * @param companyId
 * @param chunkId
 * @param data
 * @returns {axios.Promise}
 */
function putActivity(token, companyId, chunkId, data) {
  console.log(arguments);
  return axios.put(
    apiUrl + '/activity/' + chunkId,
    // payload
    data,
    {
      headers: {Authorization: 'JWT ' + token},
      params: {
        company: companyId,
        debug: true
      }
    }
  ).then(function(responce){
      console.log(JSON.stringify(responce));
    });
}

