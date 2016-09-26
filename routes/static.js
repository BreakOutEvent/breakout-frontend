'use strict';

/**
 * Routes for all static pages.
 */

const express = require('express');
const co = require('co');

const memberController = requireLocal('controller/page-controller/member');
const router = express.Router();

const renderTemplate = (type, folder, layout) => (template, title) => (req, res) => {

  let options = {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: layout,
    language: req.language,
    title: title
  };

  res.render(`${type}/${folder}/${template}`, options);
};


const masterStaticTemplate = renderTemplate('static', 'content', 'master');

//static content pages
router.get('/about', masterStaticTemplate('about', 'About'));


router.get('/members', (req, res, next) => co(function*() {
  memberController.teamPage(req.language, res);
}).catch(ex => next(ex)));


module.exports = router;
