'use strict';

const Model = require('objection').Model;

class Variable extends Model {
  static get tableName() {
    return 'Variable';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['viewId', 'name', 'language', 'value'],

      properties: {
        _id: { type: 'integer' },
        viewId: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        language: { type: 'string', minLength: 1, maxLength: 255 },
        value: { type: 'string', minLength: 1 },
      },
    };
  }

  static get relationMappings() {
    return {
      page: {
        relation: Model.OneToOneRelation,
        modelClass: __dirname + '/View',
        join: {
          from: 'Variable.viewId',
          to: 'View._id',
        },
      },
    };
  }
}

module.exports = Variable;
