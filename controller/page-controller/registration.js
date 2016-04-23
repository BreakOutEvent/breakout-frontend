'use strict';
const api = requireLocal('controller/api-proxy');
const session = requireLocal('controller/session');
const co = require('co');
const _ = require('lodash');

const URLS = {
  REGISTER: '/register',
  PARTICIPANT: '/participant',
  SPONSOR: '/sponsor',
  SELECTION: '/selection',
  TEAM: '/team-create',
  INVITE: '/team-invite',
  TEAM_SUCCESS: '/team-success',
  SPONSOR_SUCCESS: '/sponsor-success'
};

let registration = {};

registration.createUser = (req, res, next) => {
  if (!req.body) return next(new Error('The server did not receive any data.'));

  api.createUser(req.body.email, req.body.password)
    .then(() => {
      api.authenticate(req.body.email, req.body.password).then(token => {
        passport.login(token, err => {
          if (err) {
            throw new Error('Could not create a session.');
          }

          res.send({
            nextUrl: URLS.SELECTION
          });
        });
      }).catch(err => {
        throw err;
      });
    })
    .catch(err => {
      next(err);
    });
};

registration.createParticipant = (req, res, next) => {
  if (!req.body) return next(new Error('The server did not receive any data.'));

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

  session.getUserInfo(req)
    .then(user => {
      api.putModel('user', user.id, req.user, updateBody)
        .then(backendUser => {
          console.log(backendUser);

          if (req.file) {
            api.uploadPicture(req.file, backendUser.profilePic[0])
              .then(() => res.send({
                nextURL: URLS.INVITE
              }))
              .catch(err => {
                throw err;
              });
          }

          logger.info('Created a new participant', updateBody);

          session.forceUpdate(req);
          res.send({
            nextURL: URLS.INVITE
          });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch(err => next(err));
};

registration.getInvites = (req) => co(function*() {
  logger.info('Trying to get all invites for', req.user);

  const events = yield registration.getEvents(req);

  const allInvites = yield events.reduce(
    (init, e) => _.concat(init, api.getModel(`/event/${e.id}/team/invitation/`, req.user))
  );

  logger.info('Got all Invites for user', req.user);

  console.dir(allInvites);

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

  if (!req.body) sendErr(res, 'Did not receive any data');

  let me = yield api.getCurrentUser(req.user);

  yield api.postModel(`/event/${req.body.eventID}/team/${req.body.teamID}/member/`, { email: me.email });

  res.send({
    result: 'success'
  });

}).catch(ex => next(ex));

registration.createSponsor = (req, res) => co(function*() {
  logger.info('Trying to create team for event', req.body.event, 'with name', req.body.firstname, ' ', req.body.lastname);

  let sponsorData = {
    lastname: req.body.lastname,
    firstname: req.body.lastname,
    gender: req.body.gender.value,
    streetAndNumber: req.body.streetAndNumber,
    zipCode: req.body.zip_code,
    country: req.body.country

  };

  if (req.file) {
    logger.info('Found logo for sponsor in ', req.body.event, 'with name', req.body.firstname, ' ', req.body.lastname);
    sponsorData.sponsorLogo = ['image'];
  }

  const sponsor =
      yield api.postModel(`event/${req.body.event}/sponsor/`, req.user, sponsorData);

  if (req.file) {
    yield api.uploadPicture(req.file, sponsor.sponsorLogo);
  }

  logger.info('Created Sponsor',req.body.firstname, ' ', req.body.lastname, 'for event', req.body.event);


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

  yield api.inviteUser(req.user, req.body.event, team.id, req.body.email);

  logger.info('Created Invitation for user', req.body.email, 'to team', team.id);

  res.send({
    nextURL: URLS.TEAM_SUCCESS
  });
}).catch(ex => next(ex));

registration.inviteUser = (req, res) => co(function*() {

  const me = yield api.getCurrentUser(req.user);

  if(!me.participant) {
    return res.status(500).send({error:'User is not a participant!'});
  }

  const invite = yield api.inviteUser(req.user, me.participant.eventId, me.participant.teamId, req.body.email);


  if(invite) {
    res.send({error:''});
  } else {
    return res.status(500).send({error:'Invite creation failed!'});
  }

}).catch(ex => {
  throw ex;
});


module.exports = registration;
