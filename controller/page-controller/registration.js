'use strict';
const api = require('../api-proxy');
const session = require('../session');

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

let reg = {};

const sendErr = (req, res, errMsg) => {
  res.status(500).send({error: errMsg})
};

reg.createUser = (req, res) => {
  return new Promise((resolve, reject) =>
    api.createUser(email, password)
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        if (err) {
          reject(err);
          console.error(err);
        }
      })
  );
};

reg.createParticipant = (req, res) => {
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

  console.log(updateBody);

  session.getUserInfo(req)
    .then(user => {
      api.putModel('user', user.id, req.user, updateBody)
        .then(() => {
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
        })
    })
    .catch(err => {
      console.log(err);
      sendErr(req, res, err.error);
    });
};

reg.getInvites = (req) => {
  return new Promise((resolve, reject) => {
    reg.getEvents(req)
      .then(events => {
        console.log(events);
        if (!events.length) {
          resolve([]);
        } else {
          //TODO query each event with loop
          api.getModel(`/event/0/team/invitation/`, req.user)
            .then(invites_0 => {
              api.getModel(`/event/1/team/invitation/`, req.user)
                .then(invites_1 => {
                  resolve(invites_0.concat(invites_1));
                })
            })
        }
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  })
};

reg.getEvents = (req) => {
  return new Promise((resolve, reject) => {
    session.getUserInfo(req)
      .then(user => {
        console.log(user);
        api.getModel('event', req.user)
          .then(events => {
            resolve(events);
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  });
};

reg.joinTeam = (req, res) => {

};


reg.createSponsor = (req, res) => {
  //@TODO IMPLEMENT
};

reg.createTeam = (req, res) => {
  api.postModel(`event/${req.body.event}/team/`, req.user, {name: req.body.teamname})
    .then(team => {
      api.postModel(`event/${req.body.event}/team/${team.id}/invitation/`, req.user, {email: req.body.email})
        .then(() => {
          res.send({
            nextURL: URLS.TEAM_SUCCESS
          });
        })
        .catch((err) => {
          console.log(err);
          sendErr(req, res, 'Could not save your data');
        });
    })
    .catch((err) => {
      console.log(err);
      sendErr(req, res, 'Could not save your data');
    });
};


module.exports = reg;