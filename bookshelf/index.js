// // Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
      user: 'dimo',
      password:'bar',
      database:'poster_shop',
      host:'127.0.0.1'
    }
})
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf;

// Setting up the database connection
// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST
//   }
// })
// const bookshelf = require('bookshelf')(knex)

// module.exports = bookshelf;