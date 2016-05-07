'use strict';

/**
 * Controller for all registration routes and functions.
 */

const co = require('co');
const _ = require('lodash');

const passport = requireLocal('services/auth');
const session = requireLocal('controller/session');
const api = requireLocal('services/api-proxy');

/**
 * All available URLs for redirecting the user.
 * @type {*}
 */
const URLS = {
  REGISTER: '/register',
  PARTICIPANT: '/participant',
  SPONSOR: '/sponsor',
  SELECTION: '/selection',
  TEAM: '/team-create',
  INVITE: '/team-invite',
  TEAM_SUCCESS: '/team-success',
  INVITE_SUCCESS: '/invite-success',
  SPONSOR_SUCCESS: '/sponsor-success'
};

let registration = {};

/**
 * Sends the occurred error back to the client, and logs it to the bunyan global logger.
 * @param res
 * @param errMsg
 * @param err
 * @returns {*}
 */
const sendErr = (res, errMsg, err) => {

  if (err) logger.error(errMsg, err);
  else logger.error(errMsg);

  res.status(500).send({ error: errMsg });
};

/**
 * POST route for /register
 * @param req
 * @param res
 */
registration.createUser = (req, res) => co(function*() {
  if (!req.body) return sendErr(res, 'The server did not receive any data.');

  yield api.createUser(req.body.email, req.body.password);
  const token = yield api.authenticate(req.body.email, req.body.password);
  const session = yield passport.createSession(req.body.email, token);

  // TODO: It's possible that login needs too long, so the error gets thrown after the user gets
  // redirected
  req.login(session, (error) => {
    if (error) throw error;
  });

  return res.send({
    nextUrl: URLS.SELECTION
  });

}).catch(err => {
  sendErr(res, err.message, err);
});

/**
 * POST route for /participant
 * @param req
 * @param res
 * @param next
 */
registration.createParticipant = (req, res, next) => co(function*() {
  if (!req.body) return sendErr(res, 'The server did not receive any data.');

  let updateBody = {};

  let data = {};

  if (req.body.firstname) data.firstname = req.body.firstname;
  if (req.body.lastname) data.lastname = req.body.lastname;
  if (req.body.gender) data.gender = req.body.gender;

  if (Object.keys(data).length > 0) {
    updateBody = data;
  }

  let participant = {};
  if (req.body.emergencynumber) participant.emergencynumber = req.body.emergencynumber;
  if (req.body.phonenumber) participant.phonenumber = req.body.phonenumber;
  if (req.body.tshirtsize) participant.tshirtsize = req.body.tshirtsize;

  if (Object.keys(participant).length > 0) {
    updateBody.participant = participant;
  }

  if (req.file) {
    updateBody.profilePic = ['image'];
  }

  logger.info('Trying to create / update a participant', updateBody);

  const user = yield api.getCurrentUser(req.user);
  const backendUser = yield api.putModel('user', user.id, req.user, updateBody);

  if (req.file) {
    yield api.uploadPicture(req.file, backendUser.profilePic[0]);
  }

  logger.info('Created / updated a participant', updateBody);

  yield session.refreshSession(req);
  return res.send({
    nextURL: URLS.INVITE
  });

}).catch(err => {
  sendErr(res, err.message, err);
});

/**
 * POST route for /team-invite
 * @param req
 * @param res
 * @param next
 */
registration.joinTeamAPI = (req, res, next) => co(function*() {

  if (!req.body) return sendErr(res, 'Did not receive any data');

  let me = yield api.getCurrentUser(req.user);

  if (me.participant.teamId !== null) {
    yield api.postModel(`/event/${req.body.event}/team/leave/`, req.user, {});
  }

  const team = yield api.postModel(
    `/event/${req.body.event}/team/${req.body.team}/member/`,
    req.user,
    { email: me.email }
  );

  if (!team) return res.status(500).send({ error: 'Could not join team.' });

  yield session.refreshSession(req);

  //let me2 = yield api.getCurrentUser(req.user);
  // console.dir(me, me2);

  return res.send({
    error: '',
    nextUrl: URLS.INVITE_SUCCESS
  });

}).catch(err => {
  sendErr(res, err.message, err);
});

/**
 * POST route for unimplemented createSponsor endpoint.
 * @param req
 * @param res
 */
registration.createSponsor = (req, res) => co(function*() {
  logger.info(
    'Trying to create team for event',
    req.body.event,
    'with name',
    req.body.firstname,
    req.body.lastname
  );

  let sponsorData = {
    lastname: req.body.lastname,
    firstname: req.body.lastname,
    gender: req.body.gender.value,
    streetAndNumber: req.body.streetAndNumber,
    zipCode: req.body.zip_code,
    country: req.body.country
  };

  if (req.file) {
    logger.info(
      'Found logo for sponsor in ',
      req.body.event,
      'with name',
      req.body.firstname,
      ' ',
      req.body.lastname
    );
    sponsorData.sponsorLogo = ['image'];
  }

  const sponsor =
    yield api.postModel(`event/${req.body.event}/sponsor/`, req.user, sponsorData);

  if (req.file) {
    yield api.uploadPicture(req.file, sponsor.sponsorLogo);
  }

  logger.info(
    'Created Sponsor',
    req.body.firstname,
    ' ',
    req.body.lastname,
    'for event',
    req.body.event);

  if (!sponsor) return sendErr(res, 'Sponsor creation failed!');

  res.send({
    nextURL: URLS.SPONSOR_SUCCESS
  });
}).catch(err => {
  sendErr(res, err.message, err);
});

/**
 * POST route for /team-create
 * @param req
 * @param res
 * @param next
 */
registration.createTeam = (req, res, next) => co(function*() {
  logger.info('Trying to create team for event', req.body.event, 'with name', req.body.teamname);

  let teamData = {
    name: req.body.teamname
  };

  if (req.file) {
    logger.info('Found picture for team in ', req.body.event, 'with name', req.body.teamname);
    teamData.profilePic = ['image'];
  }

  const team =
    yield api.postModel(`event/${req.body.event}/team/`, req.user, teamData);

  if (req.file) {
    yield api.uploadPicture(req.file, team.profilePic);
  }

  logger.info('Created Team', req.body.teamname, 'for event', req.body.event);

  if (req.body.email) {
    logger.info('Trying to invite user', req.body.email, 'to team', team.id);

    const invite = yield api.inviteUser(req.user, req.body.event, team.id, req.body.email);

    if (!invite) return sendErr(res, 'Invite creation failed!');

    logger.info('Created Invitation for user', req.body.email, 'to team', team.id);
  }

  yield session.refreshSession(req);

  res.send({
    nextURL: URLS.TEAM_SUCCESS
  });
}).catch(err => {
  sendErr(res, err.message, err);
});

/**
 * POST route for /invite
 * @param req
 * @param res
 */
registration.inviteUser = (req, res) => co(function*() {

  const me = yield api.getCurrentUser(req.user);

  if (!me.participant) {
    return res.status(500).send({ error: 'User is not a participant!' });
  }

  const invite =
    yield api.inviteUser(req.user, me.participant.eventId, me.participant.teamId, req.body.email);

  if (invite) {
    res.send({ error: '' });
  } else {
    return res.status(500).send({ error: 'Invite creation failed!' });
  }

}).catch(err => {
  sendErr(res, err.message, err);
});

/**
 * Generates the transaction purpose for the given user.
 * @param user
 */
registration.getTransactionPurposeByUser = (user) => co(function*() {
  return `${user.participant.teamId}-BO16-${user.firstname}-${user.lastname}`
    .replace('ä', 'ae').replace('ü', 'ue').replace('ö', 'oe')
    .replace('Ä', 'Ae').replace('Ü', 'Ue').replace('Ö', 'Oe')
    .replace('ß', 'ss').replace(/[^A-Za-z0-9-]/, '')
    .substring(0, 140);
}).catch((ex) => {
  throw ex;
});

/**
 * Gets the transaction purpose.
 * @param req
 */
registration.getTransactionPurpose = (req) => co(function*() {
  const me = yield api.getCurrentUser(req.user);
  return yield registration.getTransactionPurposeByUser(me);
}).catch(ex => {
  throw ex;
});

/**
 * Activates the given token and refreshes our user session.
 * @param token
 */
registration.activateUser = (token) => co(function*() {
  yield api.activateUser(token);
  yield session.refreshSession(req);
}).catch(ex => {
  throw ex;
});

/**
 * Returns an invite for a provided token.
 * @param token
 */
registration.getInviteByToken = (token) => co(function*() {
  return yield api.getInviteByToken(token);
}).catch(ex => {
  throw ex;
});

/**
 * Returns all invites for the currently logged in user, req.user.
 * @param req
 */
registration.getInvites = (req) => co(function*() {
  logger.info('Trying to get all invites for', req.user);

  const events = yield registration.getEvents(req);

  let allInvites = yield events.map((e) => api.getModel(`/event/${e.id}/team/invitation/`, req.user));

  //ADD CITY
  allInvites = allInvites.map((invites, index) => {
    return invites.map(invite => {
      invite.city = events[index].city;
      invite.event = events[index].id;
      return invite;
    });
  });

  //FLATTEN ARRAY
  allInvites = [].concat.apply([], allInvites); // TODO: Maybe _.flatMap

  //REMOVE DUPLICATES
  allInvites = _.uniq(allInvites);

  logger.info('Got all Invites for user', req.user);

  return allInvites;
}).catch(ex => {
  throw ex;
});

/**
 * Returns all events for the logged in user.
 * @param req
 */
registration.getEvents = (req) => co(function*() {
  logger.info('Trying to get all events');

  const events = yield api.getModel('event', req.user);

  if (!events.length) {
    throw new Error('No events');
  }

  logger.info('Got all events');

  return events;
}).catch(ex => {
  throw ex;
});

module.exports = registration;
