exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Page', function (table) {
      table.bigincrements('_id').primary().unsigned();
    }),

    knex.schema.createTable('Property', function (table) {
      table.bigincrements('_id').primary();
      table.biginteger('pageId').unsigned().references('_id').inTable('Page').notNullable();
      table.string('title').notNullable();
      table.string('language').notNullable();
      table.string('url').notNullable();
      table.unique(['language', 'url']);
    }),

    knex.schema.createTable('View', function (table) {
      table.bigincrements('_id').primary();
      table.biginteger('pageId').unsigned().references('_id').inTable('Page').notNullable();
      table.string('template').notNullable();
      table.biginteger('order').unsigned().notNullable();
    }),

    knex.schema.createTable('Variable', function (table) {
      table.bigincrements('_id').primary();
      table.biginteger('viewId').unsigned().references('_id').inTable('View').notNullable();
      table.string('name').notNullable();
      table.string('language').notNullable();
      table.text('value').notNullable();
      table.unique(['name', 'language']);
    }),
  ]);
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('Variable')
    .dropTableIfExists('View')
    .dropTableIfExists('Property')
    .dropTableIfExists('Page');
};
