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

  static getClientSideUrl() {
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port || 80}`;
  }

  static initFromServer() {
    const url = `${BreakoutApi.getClientSideUrl()}/client-config`;
    return axios.get(url)
      .then(resp => resp.data)
      .then(data => {
        return new BreakoutApi(data.baseUrl, data.clientId, data.clientSecret, true);
      });
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
   * Perform the at the frontend
   *
   * @param email The users email address
   * @param password The users passworc
   *
   * @return {*|AxiosPromise} A promise that returns
   * the html from the page where the user would normally
   * be redirected to
   */
  frontendLogin(email, password) {
    const data = qs.stringify({
      username: email,
      password: password
    });
    return this.instance.post(`${BreakoutApi.getClientSideUrl()}/login`, data)
      .then(resp => resp.data);
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
  async login(email, password) {

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

    const response = await this.instance.post('/oauth/token', formData, options);
    const data = response.data;
    this.setAccessToken(data.access_token);
    return response.data;
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

  requestPasswordReset(email) {
    const data = {
      email: email
    };
    return this.instance.post('/user/requestreset/', data).then(resp => resp.data);
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

  /**
   * Get all events for breakout
   *
   * @return {*|AxiosPromise} An array of events
   */
  getAllEvents() {
    return this.instance.get('/event/').then(resp => resp.data);
  }

  /**
   * Get all invitations for the authenticated user for a specific event
   *
   * The user needs to be authenticated (via login() or setAccessToken())
   *
   * @param eventId The id of the event for which we want to see all invitations
   * @return {*|AxiosPromise} An array of events
   */
  getInvitations(eventId) {
    return this.instance.get(`/event/${eventId}/team/invitation/`).then(resp => resp.data);
  }

  /**
   * Creates a new team at a specific event
   *
   * The user needs to be authenticated (via login() or setAccessToken())
   *
   * @param eventId
   * @param teamData
   *
   * {
   *    "name": "what an awesome teamname",
   *    "description": "Description of this team"
   * }
   *
   * @return {*|AxiosPromise} An object containing all the data for a newly created team
   *
   */
  createTeam(eventId, teamData) {
    return this.instance.post(`/event/${eventId}/team/`, teamData).then(resp => resp.data);
  }

  getMe() {
    return this.instance.get('/me/').then(resp => resp.data);
  }

  async isUserParticipant() {
    const me = await this.getMe();
    if (!me.participant) {
      return false;
    } else {
      return true;
    }
  }

  async joinTeam(teamId) {


    const me = await this.getMe();

    // This hack is needed because request needs some sort of eventId, no matter which one
    // TODO: Fix in backend and then here!
    const events = await this.getAllEvents();
    const someEventId = events[0].id;

    const response = await this.instance.post(`/event/${someEventId}/team/${teamId}/member/`, {
      email: me.email
    });

    return response.data;
  }

  getTeamById(teamId) {
    // -1 as event id, because the route needs param here but not checked in backend
    // TODO: Fix in backend and then here!
    return this.instance.get(`/event/-1/team/${teamId}/`).then(resp => resp.data);
  }

  async inviteToTeam(teamId, email) {

    const team = await this.getTeamById(teamId);
    const event = team.event;

    const data = {
      email: email
    };
    console.log(data);
    const response = await this.instance.post(`/event/${event}/team/${teamId}/invitation/`, data);
    return response.data;
  }

}

module.exports = BreakoutApi;