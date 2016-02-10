var axios = require('axios');
var apiUrl = '';

module.exports = function (url) {
  // set global url for API
  apiUrl = url;

  return {
    register: register,
    login: login,
    postCompany: postCompany,
    putActivity: putActivity,
    postInvitation: postInvitation
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
 * @param parentCompanyId
 * @returns {axios.Promise}
 */
function postCompany(token, data, parentCompanyId) {
  if (parentCompanyId) {
    return axios.post(apiUrl + '/companies?company=' + parentCompanyId, data, {headers: {Authorization: 'JWT ' + token}});
  }

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
  )
    .then(function(responce){
      console.log(JSON.stringify(responce));
    });
}

/**
 *
 * @param token
 * @param companyId
 * @param data
 * @returns {axios.Promise}
 */
function postInvitation(token, companyId, data) {
  return axios.post(
    apiUrl + '/invitations/',
    // payload
    data,
    {
      headers: {Authorization: 'JWT ' + token},
      params: {
        company: companyId,
        debug: true
      }
    }
  )
    //.then(function(responce){
    //  console.log(JSON.stringify(responce));
    //});
}

