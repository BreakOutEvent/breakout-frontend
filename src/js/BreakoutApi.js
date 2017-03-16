'use strict';

const axios = require('axios');
const qs = require('qs');

class BreakoutApi {

  constructor(url, clientId, clientSecret, debug) {
    this.url = url;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.instance = axios.create({
      baseURL: `${url}`
    });

    if (debug && debug === true) {
      this.registerDebugInterceptor();
    }
  }

  registerDebugInterceptor() {
    this.instance.interceptors.request.use(config => {
      // TODO: use logger
      console.log(`${config.method.toUpperCase()} ${config.url}`);
      return config;
    }, error => {
      return Promise.reject(error);
    });
  }

  /**
   * Perform login for user with email and password
   *
   * A side effect of this operation is that the returned access token
   * is saved in this instance of the class BreakoutApi, so that all following
   * requests are authenticated with the users access_token
   *
   * @param email The users email address
   * @param password The users password
   * @returns {*|AxiosPromise} A promise which contains the api response
   */
  login(email, password) {

    const formData = qs.stringify({
      username: email,
      password: password,
      grant_type: 'password',
      scope: 'read write',
      client_id: this.clientId,
      client_secret: this.clientSecret
    });

    const options = {
      auth: {
        username: this.clientId,
        password: this.clientSecret
      }
    };

    return this.instance.post('/oauth/token', formData, options).then(resp => {
      this.setAccessToken(resp.data.access_token);
      return resp.data;
    });
  }

  setAccessToken(accessToken) {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  createAccount(email, password) {
    return this.instance.post('/user/', {
      email: email,
      password: password
    }).then(resp => resp.data);
  }

  /**
   * Let the user become a participant by submitting the needed data
   *
   * The user needs to be authenticated (via login() or setAccessToken())
   *
   * @param userId The userId of the user to become a participant
   * @param userData The data of the user to become a participant. Can contain:
   *
   * {
   *  "firstname" : "MyFirstName",
   *  "lastname" : "MyLastname",
   *  "participant" : {
   *      "emergencynumber" : "12345678",
   *      "tshirtsize" : "XL",
   *      "phonenumber" : "87654321"
   *   }
   * }
   *
   * @return {*|AxiosPromise} A promise which contains the api response
   */
  becomeParticipant(userId, userData) {
    return this.instance.put(`/user/${userId}/`, userData).then(resp => resp.data);
  }

}

module.exports = BreakoutApi;