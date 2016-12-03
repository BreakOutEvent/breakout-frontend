'use strict';

const testimonials = require('../../content/press/testimonials');
const memberController = require('../../controller/page-controller/member');

const pressMaterials = require('../../content/press/pressMaterials');
const pressReviews = require('../../content/press/pressReviews');

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

class StaticController {

  static render(template, title) {
    return masterStaticTemplate(template, title);
  }

  static renderPressPage(req, res) {
    const options = {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: 'master',
      language: req.language,
      title: 'Press',
      testimonials: testimonials,
      pressMaterials: pressMaterials,
      pressReviews: pressReviews
    };

    res.render('static/content/press', options);
  }

  static renderTeamPage(req, res) {
    return memberController.teamPage(req.language, res);
  }
}

module.exports = StaticController;