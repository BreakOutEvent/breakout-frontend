'use strict';

const Model = require('objection').Model;

class Property extends Model {
  static get tableName() {
    return 'Property';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['pageId', 'title', 'language', 'url'],

      properties: {
        _id: { type: 'integer' },
        pageId: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        language: { type: 'string', minLength: 1, maxLength: 255 },
        url: { type: 'string', minLength: 1, maxLength: 255 },
      },
    };
  }

  static get relationMappings() {
    return {
      page: {
        relation: Model.OneToOneRelation,
        modelClass: __dirname + '/Page',
        join: {
          from: 'Property.pageId',
          to: 'Page._id',
        },
      },
    };
  }
}

module.exports = Property;
