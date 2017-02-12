/**
 * Created by florianschmidt on 12/02/2017.
 */

const config = require('../config/config');

const space = config.space;
const accessToken = config.accessToken;

const contentful = require('contentful');

const contentfulClient = contentful.createClient({
  space: space,
  accessToken: accessToken
});

function getFieldsForContentType(contentType, locale) {
  return this.contentfulClient.getEntries({
    content_type: contentType,
    locale: locale,
  }).then(res => res.items.map(item => item.fields));
}

module.exports = {
  getFieldsForContentType,
  contentfulClient
};
