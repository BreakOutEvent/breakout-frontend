'use strict';
const api = requireLocal('controller/api-proxy');
const session = requireLocal('controller/session');
const co = require('co');
const _ = require('lodash');
const passport = requireLocal('controller/auth');

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

const refreshSession = (req) => co(function*() {
  req.login(yield passport.createSession(req.user.email, req.user), (error) => {
    if (error) throw error;
  });
}).catch(ex => {
  throw ex;
});

const sendErr = (res, errMsg, err) => {

  if (err) logger.error(errMsg, err);
  else logger.error(errMsg);

  res.status(500).send({ error: errMsg });
};

registration.createUser = (req, res) => co(function*() {
  if (!req.body) return sendErr(res, 'The server did not receive any data.');

  const user = yield api.createUser(req.body.email, req.body.password);
  const token = yield api.authenticate(req.body.email, req.body.password);
  const session = yield passport.createSession(req.body.email, token);
  req.login(session, (error) => {
    if (error) throw error;
  });

  return res.send({
    nextUrl: URLS.SELECTION
  });

}).catch(err => {
  sendErr(res, err.message, err);
});

registration.createParticipant = (req, res, next) => co(function*() {
  if (!req.body) return sendErr(res, 'The server did not receive any data.');

  let updateBody = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    gender: req.body.gender,
    participant: {
      emergencynumber: req.body.emergencynumber,
      phonenumber: req.body.phonenumber,
      tshirtsize: req.body.tshirtsize
    }
  };

  if (req.file) {
    updateBody.profilePic = ['image'];
  }

  logger.info('Trying to create a new participant', updateBody);

  const user = yield api.getCurrentUser(req.user);
  const backendUser = yield api.putModel('user', user.id, req.user, updateBody);


  if (req.file) {
    yield api.uploadPicture(req.file, backendUser.profilePic[0]);
  }

  logger.info('Created a new participant', updateBody);

  yield refreshSession(req);
  return res.send({
    nextURL: URLS.INVITE
  });

}).catch(err => {
  sendErr(err, err.message, err);
});

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

registration.getInviteByToken = (token) => co(function*() {
  return yield api.getInviteByToken(token);
}).catch(ex => {
  throw ex;
});

registration.joinTeamAPI = (req, res, next) => co(function*() {

  if (!req.body) return sendErr(res, 'Did not receive any data');

  let me = yield api.getCurrentUser(req.user);

  if (me.participant.teamId !== null) {
    yield api.postModel(`/event/${req.body.event}/team/leave/`, req.user, {});
  }

  const team = yield api.postModel(`/event/${req.body.event}/team/${req.body.team}/member/`,
    req.user, { email: me.email });

  if (!team) return res.status(500).send({ error: 'Could not join team.' });

  yield refreshSession(req);
  let me2 = yield api.getCurrentUser(req.user);

  console.dir(me,me2);

  return res.send({
    error: '',
    nextUrl: URLS.INVITE_SUCCESS
  });

}).catch(ex => {
  logger.error(ex);
  res.status(500).send({
    error: ex
  });
});

registration.createSponsor = (req, res) => co(function*() {
  logger.info('Trying to create team for event', req.body.event, 'with name', req.body.firstname,
    req.body.lastname);

  let sponsorData = {
    lastname: req.body.lastname,
    firstname: req.body.lastname,
    gender: req.body.gender.value,
    streetAndNumber: req.body.streetAndNumber,
    zipCode: req.body.zip_code,
    country: req.body.country

  };

  if (req.file) {
    logger.info('Found logo for sponsor in ', req.body.event, 'with name', req.body.firstname, ' ',
      req.body.lastname);
    sponsorData.sponsorLogo = ['image'];
  }

  const sponsor =
    yield api.postModel(`event/${req.body.event}/sponsor/`, req.user, sponsorData);

  if (req.file) {
    yield api.uploadPicture(req.file, sponsor.sponsorLogo);
  }

  logger.info('Created Sponsor', req.body.firstname, ' ', req.body.lastname, 'for event',
    req.body.event);

  if (!sponsor) return res.status(500).send({ error: 'Sponsor creation failed!' });

  res.send({
    nextURL: URLS.SPONSOR_SUCCESS
  });
}).catch(ex => {
  throw ex;
});

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

  logger.info('Trying to invite user', req.body.email, 'to team', team.id);

  const invite = yield api.inviteUser(req.user, req.body.event, team.id, req.body.email);

  if (!invite) return res.status(500).send({ error: 'Invite creation failed!' });

  logger.info('Created Invitation for user', req.body.email, 'to team', team.id);

  yield refreshSession(req);

  res.send({
    nextURL: URLS.TEAM_SUCCESS
  });
}).catch(ex => {
  logger.error(ex);
  res.status(500).send({
    error: ex
  });
});

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

}).catch(ex => {
  throw ex;
});

registration.getTransactionPurpose = (req) => co(function*() {
  const me = yield api.getCurrentUser(req.user);

  return (Math.random().toString(36).substr(2, 8) + '-' + me.participant.teamId + '-' + 'BO16-' +
    me.firstname + '-' + me.lastname ).replace('ä','ae').replace('ü','ue').replace('ö','oe').replace('ß','ss').substring(0,140);
}).catch(ex => {
  throw ex;
});

registration.activateUser = (token) => co(function*() {
  return yield api.activateUser(token);
}).catch(ex => {
  throw ex;
});

module.exports = registration;
