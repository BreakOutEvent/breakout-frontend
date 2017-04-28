'use strict';
/**
 * Controller for the admin page.
 */

const co = require('co');
const _ = require('lodash');
const api = require('../../services/api-proxy');
const Promise = require('bluebird');
const logger = require('../../services/logger');

let admin = {};

const defaultOptions = (req) => {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    isLoggedIn: req.user,
    language: req.language
  };
};

admin.showDashboard = (req, res) => {
  let options = defaultOptions(req);
  options.view = 'admin-dashboard';
  options.data = {};
  res.render('static/admin/dashboard', options);
};

admin.showDashboardEmails =  (req, res) => {
  let options = defaultOptions(req);
  options.view = 'admin-emails';
  options.data = {};
  res.render('static/admin/dashboard', options);
};

admin.showDashboardPayment = function* (req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-payment';
  options.data = yield admin.getInvoices(req);
  options.data = options.data
    .filter(invoice => invoice.event.isCurrent)
    .sort(invoice => invoice.event.id)
    .reverse();
  res.render('static/admin/dashboard', options);
};

admin.showDashboardCheckin = function* (req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-checkin';
  options.data = yield admin.getAllTeams(req);
  res.render('static/admin/dashboard', options);
};

admin.showOverview = function* (req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-teamoverview';
  options.data = yield admin.getTeamOverview(req);

  res.render('static/admin/dashboard', options);
};

admin.showDashboardInvoice = function* (req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-invoice';
  options.data = yield admin.getAllInvoices(req);
  res.render('static/admin/dashboard', options);
};

admin.addPayment = function *(req, res) {
  logger.info(`Trying to add payment for invoice ${req.body.invoice}`);

  try {
    let payment = yield api.postModel(`invoice/${req.body.invoice}/payment/`, req.user, {amount: req.body.amount});
    res.sendStatus(200);
  } catch (err) {
    res.status(500);
    logger.error(`An error occured while trying to add a payment to invoice ${req.body.invoice}: `, err);
    if (err.message) {
      res.json({message: err.message});
    } else {
      res.json({message: 'An unknown error occured'});
    }

  }
};

admin.getInvoices = (req) => co(function*() {
  const events = yield api.getModel('event', req.user);

  let teamsByEvent = yield events.map((e) => api.getModel(`event/${e.id}/team`, req.user));
  let allTeams = _.flatten(teamsByEvent);

  let allInvoices = [];

  for (let i = 0; i < allTeams.length; i++) {
    let t = allTeams[i];
    if(t.members.length > 1) {
      let invoice = yield api.getModel('invoice/teamfee', req.user, t.invoiceId);
      invoice.event = events[t.event - 1];
      invoice.members = t.members;
      invoice.teamName = t.name;
      invoice.id = t.invoiceId;
      invoice.teamId = t.id;
      if (invoice.payments.length) {
        invoice.open = invoice.amount - invoice.payments.reduce((prev, curr) => {
          return prev + curr.amount;
        }, 0);
      } else {
        invoice.open = invoice.amount;
      }
      allInvoices.push(invoice);
    }
  }

  return allInvoices;
}).catch((ex) => {
  throw ex;
});

admin.getAllTeams = function() {
  return Promise.resolve(api.event.all())
    .map(event => api.team.getAllByEvent(event.id))
    .reduce((a, b) => a.concat(b), [])
    .filter(team => team.hasFullyPaid);
};

admin.getTeamOverview = function() {
  let fakeData = [{
	teamId: 100,
	teamName: "JetztoderNie",
	members: [{
		id: "101",
		name: "Florian Schmidt",
		emergencyPhone: "0928144444",
		contactPhone: "11111"
	}, {
		id: "102",
		name: "Max Mustermann",
		emergencyPhone: "0928166666",
		contactPhone: "2222"
	}],
	event: {
		name: "BreakOut München 2017",
	},
	lastPosting: {
		timestamp: 1493028234169,
		id: 1274
	},
	lastLocation: {
		coord: {
			lat: 53.2,
			lon: 14.4
		},
		id: 9357
	},
	lastContactWithHeadquarters: {
		timestamp: 1493028236493,
		comment: "Alles easy, läuft gut bei denen"
	}
},
{
teamId: 100,
teamName: "Berlinberlin",
members: [{
  id: "101",
  name: "Florian S.",
  emergencyPhone: "0928144444",
  contactPhone: "11111"
}, {
  id: "102",
  name: "Max Hipstermann",
  emergencyPhone: "0928166666",
  contactPhone: "2222"
}],
event: {
  name: "BreakOut Berlin 2017",
},
lastPosting: {
  timestamp: 1493028234169,
  id: 1274
},
lastLocation: {
  coord: {
    lat: 53.2,
    lon: 14.4
  },
  id: 9357
},
lastContactWithHeadquarters: {
  timestamp: 1493028236493,
  comment: "Berlin ist besser als München"
}
},
{
teamId: 200,
teamName: "Nie0derJetzt",
members: [{
  id: "101",
  name: "Felix Schmidt",
  emergencyPhone: "0928144444",
  contactPhone: "11111"
}, {
  id: "102",
  name: "Peter partnerPage",
  emergencyPhone: "0928166666",
  contactPhone: "2222"
}],
event: {
  name: "BreakOut Berlin 2017",
},
lastPosting: {
  timestamp: 1493028234169,
  id: 1274
},
lastLocation: {
  coord: {
    lat: 53.2,
    lon: 14.4
  },
  id: 9357
},
lastContactWithHeadquarters: {
  timestamp: 1493028236493,
  comment: "OMG"
}
}]

  return Promise.resolve(fakeData)
};

admin.checkinTeam = function *(req, res) {

  let checkin = yield api.putModel(
    `event/${req.body.event}/team/`, req.body.team,
    req.user,
    { hasStarted: true }
  );

  if (!checkin) return res.sendStatus(500);

  return res.sendStatus(200);
};


admin.getAllInvoices = (req) => co(function*() {

  let rawInvoices =  yield api.invoice.getAll(req.user);

  var teams = [];



  var invoices = rawInvoices.map(i => {
    if (i.payments.length) {
      i.payed = i.payments.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);
      i.open = i.amount - i.payed;
      if (i.open < 0) i.open = 0;
    } else {
      i.payed = 0;
      i.open = i.amount;
    }
    return i;
  });


  invoices.forEach(i => {
    if(!teams[i.teamId]) teams[i.teamId] = 0;
    teams[i.teamId] += i.payed;
  });

  // TODO: This is unused, what is the reason?
  var depositTeams = teams.map((t, index) => {
    if(t > 100) {
      return {
        teamId: index,
        amount: t
      };
    }
  });

  return invoices;



}).catch((ex) => {
  throw ex;
});

admin.addAmountToInvoice = function *(req, res) {

  let addAmount = yield api.invoice.addAmount(req.user, req.body.invoiceId, req.body.amount);

  if (!addAmount) return res.sendStatus(500);

  return res.sendStatus(200);
};

admin.addInvoice = function *(req, res) {

  var body = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    company: req.body.company,
    teamId: parseFloat(req.body.teamId),
    amount: parseFloat(req.body.amount)
  };

  let addAmount = yield api.invoice.create(req.user, body);

  if (!addAmount) return res.sendStatus(500);

  return res.status(200).send(addAmount);

};

module.exports = admin;
