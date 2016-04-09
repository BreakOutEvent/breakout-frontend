'use strict';
const api = require('../api-proxy');
const session = require('../session');

const URLS = {
  PARTICIPANT: '/participant',
  SPONSOR: '/sponsor',
  SELECTION: '/selection'
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
  const sendErr = (req, res, errMsg, URL) => {
    req.flash('error', errMsg);
    res.redirect(URL);
  };

  if (!req.body) sendErr(req, res, 'The server did not receive any data', URLS.PARTICIPANT);

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

  session.getUserInfo(req)
    .then(user => {
      api.putModel('user', user.id, req.user, updateBody)
        .then(() => {
          session.forceUpdate(req);
          res.redirect('/'); //@TODO add next url
        })
        .catch((err) => {
          if (err) {
            sendErr(req, res, 'Could not save your data', URLS.PARTICIPANT);
          }
        })
    })
    .catch(err => {
      sendErr(req, res, err, URLS.PARTICIPANT);
    });


};

reg.createSponsor = (req, res) => {
  //@TODO IMPLEMENT
};


module.exports = reg;