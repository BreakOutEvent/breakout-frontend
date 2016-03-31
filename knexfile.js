module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './development.db',
    },
    seeds: {
      directory: './migrations/seeds',
    },
    pool: {
      afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb),
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'example',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },

};
