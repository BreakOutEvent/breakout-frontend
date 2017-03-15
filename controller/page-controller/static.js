'use strict';

const contentful = require('../../services/contentful');

const renderTemplate = (type, folder, layout) => (template, title) => (req, res) => {
  let options = {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: layout,
    language: req.language,
    title: title,
    isLoggedIn: req.user
  };

  res.render(`${type}/${folder}/${template}`, options);
};


const masterStaticTemplate = renderTemplate('static', 'content', 'master');

class StaticController {

  static render(template, title) {
    return masterStaticTemplate(template, title);
  }

  static *renderLandingpage(req, res) {

    const data = yield Promise.all([
      contentful.getFieldsForContentType('landingpage', req.contentfulLocale),
      contentful.getFieldsForContentType('testimonials', req.contentfulLocale),
      contentful.getFieldsForContentType('sponsor', req.contentfulLocale)
    ]);

    const landingPage = data[0];
    const testimonials = data[1];
    const sponsors = data[2];

    res.render('static/content/about', extendDefaultOptions(req, {
      title: landingPage[0].title,
      about: landingPage[0].about,
      videoOverlay: landingPage[0].videoOverlay,
      youtubeId: parseYoutubeUrl(landingPage[0].videoUrl),
      videoBackground: landingPage[0].videoBackgroundImage,
      partnerDescription: landingPage[0].partnerDescription,
      partnerImage: landingPage[0].parterImage,
      requirements: ['landingpage'],
      historyHeadline: landingPage[0].historyHeadline,
      teamCountLogo: landingPage[0].teamCountLogo,
      teamCountText: landingPage[0].teamCountText,
      amountLogo: landingPage[0].amountLogo,
      amountText: landingPage[0].amountText,
      distanceLogo: landingPage[0].distanceLogo,
      distanceText: landingPage[0].distanceText,
      leftButtonLink: landingPage[0].leftButtonLink,
      leftButtonText: landingPage[0].leftButtonText,
      buttonGroupCenterText: landingPage[0].buttonGroupCenterText,
      rightButtonLink: landingPage[0].rightButtonLink,
      rightButtonText: landingPage[0].rightButtonText,
      pressButtonText: landingPage[0].pressButtonText,
      pressButtonLink: landingPage[0].pressButtonLink,
      sponsorsButtonLink: landingPage[0].sponsorsButtonLink,
      sponsorsButtonText: landingPage[0].sponsorsButtonText,
      sponsorsHeadline: landingPage[0].sponsorsHeadline,
      sponsors: sponsors,
      testimonials: testimonials,
      layout: '', // Needs to be here, overwrites 'master' from default options!
    }));
  }

  static *renderFAQPage(req, res) {

    let faqs = yield contentful.getFieldsForContentType('faq', req.contentfulLocale);

    const options = extendDefaultOptions(req, {
      title: 'FAQ',
      faqs: faqs,
    });

    res.render('static/content/faq', options);
  }

  static *renderPressPage(req, res) {

    const data = yield Promise.all([
      contentful.getFieldsForContentType('testimonials', req.contentfulLocale),
      contentful.getFieldsForContentType('pressMaterials', req.contentfulLocale),
      contentful.getFieldsForContentType('pressReview', req.contentfulLocale)
    ]);

    const options = extendDefaultOptions(req, {
      title: 'Press',
      testimonials: data[0],
      pressMaterials: data[1],
      pressReviews: data[2]
    });

    res.render('static/content/press', options);
  }

  static *renderTermsAndConditions(req, res) {

    const page = yield contentful.getFieldsForContentType('termsAndConditions', req.contentfulLocale);

    const options = extendDefaultOptions(req, {
      title: page[0].title,
      termsAndConditions: page[0].body
    });

    res.render('static/content/termsAndConditions', options);
  }

  static *renderMemberPage(req, res) {

    const data = yield Promise.all([
      contentful.getFieldsForContentType('members', req.contentfulLocale),
      contentful.getFieldsForContentType('teammitglieder', req.contentfulLocale)
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

    let fields = yield contentful.getFieldsForContentType('nextSteps', req.contentfulLocale);
    fields = fields[0];

    let videoUrl;
    let hasVideo;

    try {
      videoUrl = parseYoutubeUrl(fields.explanationVideo);
      hasVideo = true;
    } catch (err) {
      hasVideo = false;
      videoUrl = '';
    }

    let options = extendDefaultOptions(req, {
      title: fields.titel,
      headline: fields.headline,
      inform: fields.inform,
      signUp: fields.signUp,
      findSponsors: fields.findSponsors,
      prepare: fields.prepare,
      downloadApps: fields.downloadApps,
      explanationVideo: videoUrl,
      hasVideo: hasVideo
    });

    res.render('static/content/nextSteps', options);
  }

  static *renderPartnerPage(req, res) {

    let data = yield Promise.all([
      contentful.getFieldsForContentType('partnerPage', req.contentfulLocale),
      contentful.getFieldsForContentType('supporter', req.contentfulLocale),
      contentful.getFieldsForContentType('sponsor', req.contentfulLocale),
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
    let codeOfHonours = yield contentful.getFieldsForContentType('codeOfHonour', req.contentfulLocale);

    let options = extendDefaultOptions(req, {
      title: 'Code of Honour', // TODO: Add from page
      codeOfHonours: codeOfHonours
    });

    res.render('static/content/codeOfHonour', options);
  }

  static *renderGetInvolvedPage(req, res) {

    let data = yield Promise.all([
      contentful.getFieldsForContentType('mitmachenSeite', req.contentfulLocale),
    ]);

    const page = data[0][0];

    let options = extendDefaultOptions(req, {
      page: page,
      image: page.image.fields.file.url
    });

    res.render('static/content/getInvolved', options);
  }

  static *renderImprint(req, res) {
    let data = yield contentful.getFieldsForContentType('imprint', req.contentfulLocale);

    let options = extendDefaultOptions(req, {
      imprint: data[0].disclaimer
    });

    res.render('static/content/imprint', options);
  }

}

function parseYoutubeUrl(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

function extendDefaultOptions(req, additionalOptions) {
  if (!req || !additionalOptions) {
    throw new Error('Expected two arguments: req, additionalOptions, but got one. Did you missing passing `req` to extendDefaultOptions?');
  }
  return apply(getOptions(req), additionalOptions);
}

function getOptions(req) {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    language: req.language,
    isLoggedIn: req.user
  };
}

function apply(first, second) {
  for (const attr in second) {
    first[attr] = second[attr];
  }

  return first;
}

module.exports = StaticController;
