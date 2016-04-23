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

const sendErr = (res, errMsg) => {
  logger.error(errMsg);
  res.status(500).send({ error: errMsg });
};

registration.createUser = (req, res) => {
  if (!req.body) sendErr(res, 'The server did not receive any data.');
  api.createUser(req.body.email, req.body.password)
    .then(() => {
      api.authenticate(req.body.email, req.body.password).then(token => {
        passport.login(token, err => {
          if (err) {
            sendErr(res, 'Could not create a session.');
          }

          res.send({
            nextUrl: URLS.SELECTION
          });
        });
      }).catch(err => {
        logger.error(err);
        sendErr(res, 'Unable to login.');
      });
    })
    .catch(err => {
      logger.error(err);
      sendErr(res, err.message);
    });
};

registration.createParticipant = (req, res) => {
  if (!req.body) sendErr(res, 'The server did not receive any data.');

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
        .then(backend_user => {
          console.log(backend_user);
          if (req.file) {
            api.uploadPicture(req.file, backend_user.profilePic[0])
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
          if (err) {
            console.log(err);
            sendErr(res, 'Could not save your data');
          }
        });
    })
    .catch(err => {
      console.log(err);
      sendErr(res, err.error);
    });
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

registration.joinTeamAPI = (req, res) => co(function*() {

  if (!req.body) sendErr(res, 'Did not receive any data');

  let me = yield api.getCurrentUser(req.user);

  yield api.postModel(`/event/${req.body.eventID}/team/${req.body.teamID}/member/`, { email: me.email });

  res.send({
    result: 'success'
  });

}).catch(ex => {
  throw ex;
});

registration.createSponsor = (req, res) => {
  // TODO: IMPLEMENT
};

registration.createTeam = (req, res) => co(function*() {
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
}).catch(ex => {
  throw ex;
});

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
