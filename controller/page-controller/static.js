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

  static *renderPrivacyPolicy(req, res) {
    const data = yield contentful.getFieldsForContentType('privacyPolicyPage', req.contentfulLocale);

    res.render('static/content/privacyPolicy', extendDefaultOptions(req, {
      page: data[0]
    }));
  }

  static *renderSponsorTermsAndConditions(req, res) {
    const data = yield contentful.getFieldsForContentType('sponsorTos', req.contentfulLocale);

    res.render('static/content/sponsorTos', extendDefaultOptions(req, {
      title: data[0].title,
      textContent: data[0].content
    }));
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
      selectedTestimonialHeadline: landingPage[0].selectedTestimonialHeadline,
      selectedTestimonialImage: landingPage[0].selectedTestimonialImage,
      selectedTestimonialText: landingPage[0].selectedTestimonialText,
      selectedTestimonialAuthor: landingPage[0].selectedTestimonialAuthor,
      sponsors: sponsors,
      testimonials: testimonials,
      layout: '', // Needs to be here, overwrites 'master' from default options!
    }));
  }

  static *renderFAQPage(req, res) {

    const faqs = yield contentful.getFieldsForContentType('faq', req.contentfulLocale);
    const pages = yield contentful.getFieldsForContentType('faqPage', req.contentfulLocale);
    const page = pages[0];

    const options = extendDefaultOptions(req, {
      title: page.title,
      headerImage: page.headerImage,
      faqs: faqs,
    });

    res.render('static/content/faq', options);
  }

  static *renderPressPage(req, res) {

    const data = yield Promise.all([
      contentful.getFieldsForContentType('testimonials', req.contentfulLocale),
      contentful.getFieldsForContentType('pressMaterials', req.contentfulLocale),
      contentful.getFieldsForContentType('pressReview', req.contentfulLocale),
      contentful.getFieldsForContentType('presspage', req.contentfulLocale),
    ]);

    const options = extendDefaultOptions(req, {
      title: 'Press',
      testimonials: data[0].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)),
      pressMaterials: data[1],
      pressReviews: data[2],
      pressPage: data[3][0]
    });

    res.render('static/content/press', options);
  }

  static *renderTermsAndConditions(req, res) {

    const data = yield Promise.all([
      contentful.getFieldsForContentType('termsAndConditions', req.contentfulLocale),
      contentful.getFieldsForContentType('termsAndConditionsPage', req.contentfulLocale)
    ]);

    const page = data[1][0];
    const termsAndConditions = data[0][0].body;

    const options = extendDefaultOptions(req, {
      page,
      termsAndConditions
    });

    res.render('static/content/termsAndConditions', options);
  }

  static *renderMemberPage(req, res) {

    const data = yield Promise.all([
      contentful.getFieldsForContentType('members', req.contentfulLocale),
      contentful.getFieldsForContentType('teammitglieder', req.contentfulLocale),
      contentful.getFieldsForContentType('ausschreibungen', req.contentfulLocale)
    ]);

    const fields = data[0][0];
    const members = data[1];
    const openings = data[2];

    let options = extendDefaultOptions(req, {
      titelAbout: fields.titelAbout,
      page: fields,
      teambeschreibung: fields.teambeschreibung,
      beschreibungStellenausschreibung: fields.beschreibungStellenausschreibung,
      titeStellenausschreibungen: fields.titeStellenausschreibungen,
      teamBild: fields.teamBild,
      openings: openings,
      downloadIcon: fields.downloadIcon,
      titelMembers: fields.titelMembers,
      activeMembers: members.filter(m => m.isAktive),
      inactiveMembers: members.filter(m => !m.isAktive),
      hasInactiveMembers: (members.filter(m => !m.isAktive).length > 0),
      hasMembers: (members.length > 0)
    });

    res.render('static/content/members', options);

  }

  static *renderNextSteps(req, res) {

    let response = yield Promise.all([
      contentful.getFieldsForContentType('nextSteps', req.contentfulLocale),
      contentful.getFieldsForContentType('aspectsOfBreakOut', req.contentfulLocale),
      contentful.getFieldsForContentType('aboutBreakoutPage', req.contentfulLocale),
    ]);

    let fields = response[0];
    const aspects = response[1];
    const pages = response[2];

    const page = pages[0];
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
      hasVideo: hasVideo,
      aspects: aspects.sort((a, b) => a.order > b.order),
      explanationImage: page.explanationImage,
      aspectsHeadline: page.aspectsHeadline
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
    const data = yield Promise.all([
      contentful.getFieldsForContentType('codeOfHonourPage', req.contentfulLocale),
      contentful.getFieldsForContentType('codeOfHonour', req.contentfulLocale),
    ]);

    const page = data[0][0];
    const codeOfHonours = data[1];

    const options = extendDefaultOptions(req, {
      page: page,
      codeOfHonours: codeOfHonours
    });

    res.render('static/content/codeOfHonour', options);
  }

  static *renderImprint(req, res) {
    let data = yield contentful.getFieldsForContentType('imprintPage', req.contentfulLocale);

    let options = extendDefaultOptions(req, {
      page: data[0]
    });

    res.render('static/content/imprint', options);
  }

  static *renderStatravelPage(req, res) {

    const data = yield Promise.all([
      contentful.getFieldsForContentType('staPage', req.contentfulLocale),
    ]);

    const fields = data[0][0];

    let options = extendDefaultOptions(req, {
      pageTitle: fields.PageTitle,
      headerImage: fields.headerImage,
      text: fields.description,
      logo: fields.logo,
      heading: fields.title,
      termsOfParticipation: fields.termsOfParticipation
    });

    res.render('static/content/statravel', options);

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
