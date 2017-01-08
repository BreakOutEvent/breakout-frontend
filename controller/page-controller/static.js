'use strict';

const config = require('../../config/config');

const space = config.space;
const accessToken = config.accessToken;

const memberController = require('../../controller/page-controller/member');

const contentful = require('contentful');
const contentfulClient = contentful.createClient({
  space: space,
  accessToken: accessToken
});
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

  static renderFAQPage(req, res){

    var preferredLanguage = req.acceptsLanguages()[0];
    var faqs = [];
    contentfulClient.getEntries({
      'content_type': 'faq',
      'locale': preferredLanguage
    })
    .then(function (entries) {
      var items = entries.items;
      faqs = items.map(item => item.fields);
      const options = {
        error: req.flash('error'),
        success: req.flash('success'),
        layout: 'master',
        language: req.language,
        title: 'FAQ',
        faqs: faqs,
      };
      res.render('static/content/faq', options);
    });
  }

  static *renderPressPage(req, res){
    var preferredLanguage = req.acceptsLanguages()[0];
    var testimonials = [];
    var pressMaterials = [];
    var pressReviews = [];



    let testimonialsPromise = yield contentfulClient.getEntries({
      'content_type': 'testimonials',
      'locale': preferredLanguage
    });

    let pressMaterialsPromise =  yield contentfulClient.getEntries({
      'content_type': 'pressMaterials',
      'locale': preferredLanguage
    });

    let pressReviewsPromise = yield contentfulClient.getEntries({
      'content_type': 'pressReview',
      'locale': preferredLanguage
    });

    testimonials = testimonialsPromise.items.map(item => item.fields);
    pressMaterials = pressMaterialsPromise.items.map(item => item.fields);
    pressReviews = pressReviewsPromise.items.map(item => item.fields);

    var options = {
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
