'use strict';

const Model = require('objection').Model;

class Page extends Model {
  static get tableName() {
    return 'Page';
  }

  static get relationMappings() {
    return {
      properties: {
        relation: Model.OneToManyRelation,
        modelClass: __dirname + '/Property',
        join: {
          from: 'Page._id',
          to: 'Property.pageId',
        },
      },
      views: {
        relation: Model.OneToManyRelation,
        modelClass: __dirname + '/View',
        join: {
          from: 'Page._id',
          to: 'View.pageId',
        },
      },
    };
  }
}

module.exports = Page;
