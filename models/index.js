const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName:'posters',
    mediaproperty() {
        return this.belongsTo('MediaProperty')
    },
    tags() {
        return this.belongsToMany('Tag');
    }
});

const MediaProperty = bookshelf.model('MediaProperty',{
    tableName: 'media_properties',
    posters() {
        return this.hasMany('Poster');
    }
})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    posters() {
        return this.belongsToMany('Poster')
    }
})

const User = bookshelf.model('User',{
    tableName: 'users'
})

module.exports = { Poster, MediaProperty, Tag, User };