// Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
      user: 'demo',
      password:'bar',
      database:'poster_shop',
      host:'127.0.0.1'
    }
})
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf;