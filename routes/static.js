'use strict';

/**
 * Routes for all static pages.
 */

const express = require('express');
const co = require('co');

const memberController = requireLocal('controller/page-controller/member');
const router = express.Router();

const testimonials = requireLocal('content/press/testimonials');
const pressMaterials = requireLocal('content/press/pressMaterials');
const pressReviews = requireLocal('content/press/pressReviews');

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
router.get('/press', renderPressPage);
router.get('/partner', masterStaticTemplate('partner', 'Partner'));
router.get('/about', masterStaticTemplate('about', 'About'));
router.get('/next-steps', masterStaticTemplate('nextSteps', 'Next Steps'));
router.get('/imprint', masterStaticTemplate('imprint', 'Imprint'));
router.get('/code-of-honour', masterStaticTemplate('codeOfHonour', 'Code of Honour'))
router.get('/terms-and-conditions', masterStaticTemplate('termsAndConditions', 'Terms and Conditions'))
router.get('/faq', masterStaticTemplate('faq', 'FAQ'))

router.get('/members', (req, res, next) => co(function*() {
  memberController.teamPage(req.language, res);
}).catch(ex => next(ex)));

function renderPressPage(req, res) {

  const options = {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    language: req.language,
    title: 'Press',
    testimonials: testimonials,
    pressMaterials: pressMaterials,
    pressReviews: pressReviews
  }

  res.render(`static/content/press`, options)
}


module.exports = router;
