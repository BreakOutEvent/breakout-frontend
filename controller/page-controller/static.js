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

  static renderFAQPage(req, res) {

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

  static *renderPressPage(req, res) {

    const data = yield Promise.all([
      getFieldsForContentType('testimonials', req.contentfulLocale),
      getFieldsForContentType('pressMaterials', req.contentfulLocale),
      getFieldsForContentType('pressReview', req.contentfulLocale)
    ]);

    var options = {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: 'master',
      language: req.language,
      title: 'Press',
      testimonials: data[0],
      pressMaterials: data[1],
      pressReviews: data[2]
    };

    res.render('static/content/press', options);
  }

  static *renderTermsAndConditions(req, res) {

    const page = yield getFieldsForContentType('termsAndConditions', req.contentfulLocale);

    const options = {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: 'master',
      language: req.language,
      title: page[0].title,
      termsAndConditions: page[0].body
    };

    res.render('static/content/termsAndConditions', options);
  }

  static *renderMemberPage(req, res) {

    const data = yield Promise.all([
      getFieldsForContentType('members', req.contentfulLocale),
      getFieldsForContentType('teammitglieder', req.contentfulLocale)
    ]);

    const fields = data[0][0];
    const members = data[1];

    let options = extendDefaultOptions(req, {
      title: fields.title,
      headline: fields.headline,
      description: fields.description,
      teamImage: fields.teamImage,
      activeMembers: members.filter(m => m.isAktive),
      inactiveMembers: members.filter(m => !m.isAktive),
      hasInactiveMembers: (members.filter(m => !m.isAktive).length > 0)
    });

    res.render('static/team/content', options);

  }

  static *renderNextSteps(req, res) {

    let fields = yield getFieldsForContentType('nextSteps', req.contentfulLocale);
    fields = fields[0];

    let options = extendDefaultOptions(req, {
      title: fields.titel,
      headline: fields.headline,
      inform: fields.inform,
      signUp: fields.signUp,
      findSponsors: fields.findSponsors,
      prepare: fields.prepare,
      downloadApps: fields.downloadApps,
      explanationVideo: parseYoutubeUrl(fields.explanationVideo)
    });

    res.render('static/content/nextSteps', options);
  }

  static *renderPartnerPage(req, res) {

    let data = yield Promise.all([
      getFieldsForContentType('partnerPage', req.contentfulLocale),
      getFieldsForContentType('supporter', req.contentfulLocale),
      getFieldsForContentType('sponsor', req.contentfulLocale),
    ]);

    const page = data[0][0];
    const supporters = data[1];
    const sponsors = data[2];

    let options = extendDefaultOptions(req, {
      title: page.title,
      page: page,
      supporters: supporters,
      sponsors: sponsors,
      hasSponsors: sponsors.length > 0,
      hasSupporters: supporters.length > 0
    });

    res.render('static/content/partner', options);
  }

  static *renderCodeOfHonour(req, res) {
    let codeOfHonours = yield getFieldsForContentType('codeOfHonour', req.contentfulLocale);

    let options = extendDefaultOptions(req, {
      title: 'Code of Honour', // TODO: Add from page
      codeOfHonours: codeOfHonours
    });

    res.render('static/content/codeOfHonour', options);
  }

  static *renderGetInvolvedPage(req, res) {

    let data = yield Promise.all([
      getFieldsForContentType('mitmachenSeite', req.contentfulLocale),
    ]);

    const page = data[0][0];

    let options = extendDefaultOptions(req, {
      page: page,
      image: page.image.fields.file.url
    });

    res.render('static/content/getInvolved', options);
  }

}



function getFieldsForContentType(contentType, locale) {
  return contentfulClient.getEntries({
    content_type: contentType,
    locale: locale,
  }).then(res => res.items.map(item => item.fields));
}

function parseYoutubeUrl(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

function extendDefaultOptions(req, additionalOptions) {
  return apply(getOptions(req), additionalOptions);
}

function getOptions(req) {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    language: req.language
  };
}

function apply(first, second) {
  for (const attr in second) {
    first[attr] = second[attr];
  }

  return first;
}

module.exports = StaticController;
