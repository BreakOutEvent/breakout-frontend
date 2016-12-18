'use strict';

//const testimonials = require('../../content/press/testimonials');
const memberController = require('../../controller/page-controller/member');

//const pressMaterials = require('../../content/press/pressMaterials');
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

  static renderFAQPage(req, res){
    var request = require('request');

    try{
      var preferredLanguage = req.acceptsLanguages()[0];

      request({
        url: 'https://cdn.contentful.com/spaces/i8fp6rw03mps/entries?',
        qs: {
          locale: preferredLanguage,
          access_token: '',
          content_type: 'faq'
        }
      }, function(error, response, body){
        var items = JSON.parse(body).items;
        var faqs = [];

        try{
          for(var i = 0; i < items.length; i++){
            faqs.push(items[i].fields);
          }
        }
        catch(e){
          console.log(e);
        }

        const options = {
          error: req.flash('error'),
          success: req.flash('success'),
          layout: 'master',
          language: req.language,
          title: 'FAQ',
          faqs: faqs,
        };

        res.render('static/content/faq', options);
      }
      );
    }
    catch(e){
      console.log(e);
    }
  }

  static renderPressPage(req, res){
    var request = require('request');
    var preferredLanguage = req.acceptsLanguages()[0];
    var testimonials = [];

    try{

      request({
        url: 'https://cdn.contentful.com/spaces/i8fp6rw03mps/entries?',
        qs: {
          locale: preferredLanguage,
          access_token: '',
          content_type: 'testimonials'
        }
      }, function(error, response, body){

        var items = JSON.parse(body).items;

        try{
          for(var i = 0; i < items.length; i++){
            testimonials.push(items[i].fields);
          }
        }
        catch(e){
          console.log(e);
        }
      });
    }
    catch(e){
      console.log(e);
    }

    try{

      request({
        url: 'https://cdn.contentful.com/spaces/i8fp6rw03mps/entries?',
        qs: {
          locale: preferredLanguage,
          access_token: '',
          content_type: 'pressMaterials'
        }
      }, function(error, response, body){

        var items = JSON.parse(body).items;
        var pressMaterials = [];
        try{
          for(var i = 0; i < items.length; i++){
            pressMaterials.push(items[i].fields);
          }
        }
        catch(e){
          console.log(e);
        }

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
      });
    }

    catch(e){
      console.log(e);
    }
  }


  static renderTeamPage(req, res) {
    return memberController.teamPage(req.language, res);
  }
}

module.exports = StaticController;
