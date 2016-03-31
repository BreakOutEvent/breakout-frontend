'use strict';

const Model = require('objection').Model;

class View extends Model {
  static get tableName() {
    return 'View';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],

      properties: {
        _id: { type: 'integer' },
        pageId: { type: 'integer' },
        template: { type: 'string', minLength: 1, maxLength: 255 },
        order: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      page: {
        relation: Model.OneToOneRelation,
        modelClass: __dirname + '/Page',
        join: {
          from: 'View.pageId',
          to: 'Page._id',
        },
      },
      variables: {
        relation: Model.OneToManyRelation,
        modelClass: __dirname + '/Variable',
        join: {
          from: 'View._id',
          to: 'Variable.viewId',
        },
      },
    };
  }
}

module.exports = View;
