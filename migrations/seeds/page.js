'use strict';

exports.seed = function (knex, Promise) {
  return Promise.join(

    // Deletes ALL existing entries
    knex('Variable').del(),
    knex('View').del(),
    knex('Property').del(),
    knex('Page').del(),

    // Inserts seed entries
    () => knex('Page')
      .returning('_id')
      .insert({})
      .then(id => Promise.join(
        knex('Property')
          .returning('_id')
          .insert({
            pageId: id[0],
            title: 'TestDE',
            language: 'de',
            url: 'home',
          }),
        knex('Property')
          .returning('_id')
          .insert({
            pageId: id[0],
            title: 'TestEN',
            language: 'en',
            url: 'home',
          }),
        knex('View')
          .returning('_id')
          .insert({
            pageId: id[0],
            template: 'thomy_new',
            order: 1,
          }).then(id => Promise.join(
          knex('Variable')
            .returning('_id')
            .insert({
              viewId: id[0],
              name: 'heading',
              language: 'de',
              value: 'valueDE',
            }),
          knex('Variable')
            .returning('_id')
            .insert({
              viewId: id[0],
              name: 'heading',
              language: 'en',
              value: 'valueEN',
            })
        ))
        )
      )
  );
};
