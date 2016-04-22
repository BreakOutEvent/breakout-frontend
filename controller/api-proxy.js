'use strict';

const request = require('request');

const config = {
  clientID: process.env.FRONTEND_API_CLIENTID,
  clientSecret: process.env.FRONTEND_API_CLIENTSECRET,
  URL: process.env.FRONTEND_API_URL,
  mediaURL: process.env.FRONTEND_MEDIA_URL,
  protocol: 'https'
};

const url = `${config.protocol}://${config.URL}`;

Object.keys(config).forEach(k => {
  if (!config[k])
    throw new Error(`No config entry found for ${k}`);
});

var API = {};

API.authenticate = (username, password) => {
  logger.info('Trying to login user', username);
  return new Promise((resolve, reject) => {
    request
      .post({
        url: `${url}/oauth/token`,
        qs: {
          client_id: config.clientID,
          client_secret: config.clientSecret,
          username: username,
          password: password,
          grant_type: 'password'
        },
        auth: {
          user: config.clientID,
          pass: config.clientSecret
        }
      }, handleResponse(resolve, reject, 'Authenticated user ' + username))
  });
};

API.getCurrentUser = token => {
  logger.info('Trying to get currently logged in user');
  return new Promise((resolve, reject) =>
    request
      .get({
        url: `${url}/me/`,
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Got information about currently logged in user'))
  );
};


API.getModel = (modelName, token, id) => {
  logger.info('Trying to get', modelName, 'with id', id, 'from backend');
  return new Promise((resolve, reject)=> {
      request
        .get({
          url: `${url}/${modelName}/${(id || '')}`,
          auth: {bearer: token.access_token}
        }, handleResponse(resolve, reject, 'Got ' + modelName + ' with id ' + (id || 'noID') + ' from backend'))
    }
  );
};


API.postModel = (modelName, token, body) => {
  logger.info('Sending POST request with', body, 'to', modelName);
  return new Promise((resolve, reject) =>
    request
      .post({
        url: `${url}/${modelName}`,
        auth: {bearer: token.access_token},
        body: JSON.stringify(body),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'Successfully POSTed ' + modelName + ' with ' + JSON.stringify(body) + ' to backend'))
  );
};


API.putModel = (modelName, id, token, body) => {
  logger.info('Sending PUT request with ', body, 'to', modelName, 'with ID', id);
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({error_description: 'No ID specified'});
      return;
    }
    console.log(body, token);
    request
      .put({
        url: `${url}/${modelName}/${(id)}/`,
        auth: {bearer: token.access_token},
        body: JSON.stringify(body),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'Successfully PUT ' + modelName + ' with id ' + id + ' and data ' + JSON.stringify(body) + ' to backend'));
  });
};

API.delModel = function (modelName, token, id) {
  logger.info('Sending DELETE request on',modelName,' with ID', id);
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({error_message: 'No ID specified'});
      return;
    }
    request
      .del({
        url: `${url}/${modelName}/${id}`,
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Successfully DELETEed ' + modelName + ' with ID ' + id));
  });
};

API.createUser = function (email, password) {
  logger.info('Trying to create user with email',email);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/user/`,
        auth: {
          user: config.clientID,
          pass: config.clientSecret
        },
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({email, password})
      }, handleResponse(resolve, reject, 'Successfully created user with email ' + email + ' in backend'));
  });
};

API.uploadPicture = function(file, mediaObj) {
  logger.info('Trying to upload file with id',mediaObj.id);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `http://${mediaURL}`,
        headers: {'X-UPLOAD-TOKEN': mediaObj.uploadToken},
        formData: {
          id: mediaObj.id,
          file: file
        }
      }, handleResponse(resolve, reject, 'Successfully uploaded file with id ' + mediaObj.id + ' to backend'));
  });
};

API.getPaymentToken = (invoiceID, token) => {
  logger.info('Trying to get payment token for invoice',invoiceID,'from backend');
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/invoice/${invoiceID}/payment/braintree/client_token/`,
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Got payment token for invoice ' + invoiceID + ' from backend'));
  });
};

API.checkoutPayment = (invoiceID, token, data) => {
  logger.info('Trying to checkout for invoice',invoiceID);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/invoice/${invoiceID}/payment/braintree/checkout/`,
        auth: {bearer: token.access_token},
        form: data
      }, handleResponse(resolve, reject, 'Successfully checked out invoice' + invoiceID));
  });
};

API.getInviteByToken = (token) => {
  logger.info('Trying to get invite by token',token);
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/event/?token=${token}` //TODO add real url
      }, handleResponse(resolve, reject, 'Successfully got invite by token' + token));
  });
};



function handleResponse(resolve, reject, msg) {
  return (error, response, body) => {
    if (error) {
      logger.error(error);
      throw error;
    } else {
      if (response.statusCode.toString().match(/^2\d\d$/)) {
        logger.info(msg);
        resolve(JSON.parse(body));
      } else {
        logger.error(JSON.parse(body));
        reject(JSON.parse(body));
      }
    }
  };
}

module.exports = API;
