'use strict';
const api = require('../api-proxy');
const session = require('../session');
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

const sendErr = (req, res, errMsg) => {
  res.status(500).send({error: errMsg});
};

registration.createUser = (req, res) => {
  if (!req.body) sendErr(req, res, 'The server did not receive any data.');

  // LOG: start to create a new user
  logger.info('Trying to create a new user', req.body.email);
  return new Promise((resolve, reject) =>
    api.createUser(email, password)
      .then((data) => {
        // LOG: new user created
        logger.info('Created new user', req.body.email);
        resolve(data);
      })
      .catch((err) => {
        if (err) {
          reject(err);
          console.error(err);
        }
      })
  );
};

registration.createParticipant = (req, res) => {
  if (!req.body) sendErr(req, res, 'The server did not receive any data.');

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
    updateBody.profilePic = ["image"];
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
                throw err
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
            sendErr(req, res, 'Could not save your data');
          }
        });
    })
    .catch(err => {
      console.log(err);
      sendErr(req, res, err.error);
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

registration.joinTeam = (req, res) => {

};

registration.createSponsor = (req, res) => {
  // TODO: IMPLEMENT
};

registration.createTeam = (req, res) => co(function*() {
  logger.info('Trying to create team for event', req.body.event.city, 'with name', req.body.teamname);

  const team =
    yield api.postModel(`event/${req.body.event}/team/`, req.user, {name: req.body.teamname});

  logger.info('Created Team', req.body.teamname, 'for event', req.body.event.city);

  logger.info('Trying to invite user', req.body.email, 'to team', team.id);

  yield api.postModel(
    `event/${req.body.event}/team/${team.id}/invitation/`, req.user, {email: req.body.email}
  );

  logger.info('Created Invitation for user', req.body.email, 'to team', team.id);

  res.send({
    nextURL: URLS.TEAM_SUCCESS
  });
}).catch(ex => {
  throw ex;
});

module.exports = registration;
