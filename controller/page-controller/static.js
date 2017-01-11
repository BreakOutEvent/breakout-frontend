'use strict';

const config = require('../../config/config');

const space = config.space;
const accessToken = config.accessToken;

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

    let testimonialsPromise = yield contentfulClient.getEntries({
      'content_type': 'testimonials',
      'locale': req.contentfulLocale
    });

    let pressMaterialsPromise =  yield contentfulClient.getEntries({
      'content_type': 'pressMaterials',
      'locale': req.contentfulLocale
    });

    let pressReviewsPromise = yield contentfulClient.getEntries({
      'content_type': 'pressReview',
      'locale': req.contentfulLocale
    });

    let testimonials = testimonialsPromise.items.map(item => item.fields);
    let pressMaterials = pressMaterialsPromise.items.map(item => item.fields);
    let pressReviews = pressReviewsPromise.items.map(item => item.fields);

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

  static *renderTermsAndConditions(req, res) {

    let entries = yield contentfulClient.getEntries({
      content_type: 'termsAndConditions',
      locale: req.contentfulLocale
    });

    const tos = entries.items
      .map(item => item.fields)[0]
      .body;

    const title = entries.items
      .map(item => item.fields)[0]
      .title;

    var options = {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: 'master',
      language: req.language,
      title: title,
      termsAndConditions: tos
    };

    res.render('static/content/termsAndConditions', options);
  }

  static *renderMemberPage(req, res) {

    let entries = yield contentfulClient.getEntries({
      content_type: 'members',
      locale: req.contentfulLocale
    });

    let fields = entries.items.map(item => item.fields)[0];

    let membersRes = yield contentfulClient.getEntries({
      content_type: 'teammitglieder',
      locale: req.contentfulLocale
    });

    let members = membersRes.items.map(item => item.fields);

    let options = {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: 'master',
      language: req.language,
      title: fields.title,
      headline: fields.headline,
      description: fields.description,
      teamImage: fields.teamImage,
      activeMembers: members.filter(m => m.isAktive),
      inactiveMembers: members.filter(m => !m.isAktive),
      hasInactiveMembers: (members.filter(m => !m.isAktive).length > 0)
    };

    res.render('static/team/content', options);

  }
}

module.exports = StaticController;
