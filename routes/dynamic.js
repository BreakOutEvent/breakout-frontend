const express = require('express');
const router = express.Router();

const registration = require('../controller/page-controller/registration');

router.get('/participant', (req, res) =>
  res.render('admin/login',
    {
      path: '/admin',
      error: req.flash('error')
    }
  )
);

router.post('/participant', req.isAuthenticated, registration.createParticipant);