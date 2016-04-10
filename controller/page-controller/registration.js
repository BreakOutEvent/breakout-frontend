'use strict';
const api = require('../api-proxy');
const session = require('../session');

const URLS = {
  PARTICIPANT: '/participant',
  SPONSOR: '/sponsor',
  SELECTION: '/selection',
  TEAM: '/team'
};


let reg = {};

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
  const sendErr = (req, res, errMsg) => {
    res.statusCode(500);
    res.send({error: errMsg})
  };

  if (!req.body) sendErr(req, res, 'The server did not receive any data');

  let updateBody = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    //gender: req.body.gender,
    participant: {
      emergencynumber: req.body.emergency_phone,
      phonenumber: req.body.phone,
      tshirtsize: req.body.size
    }
  };

  session.getUserInfo(req)
    .then(user => {
      api.putModel('user', user.id, req.user, updateBody)
        .then(() => {
          session.forceUpdate(req);
          res.send({
            nextURL: URLS.TEAM
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
      sendErr(req, res, err);
    });


};

reg.createSponsor = (req, res) => {
  //@TODO IMPLEMENT
};


module.exports = reg;