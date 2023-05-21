// import in the poster model
const { Poster, MediaProperty, Tag } = require('../models');

const getAllMediaProperties = async () => {
    return await MediaProperty.fetchAll().map((mediaproperty) => {
        return [mediaproperty.get('id'), mediaproperty.get('name')];
    })
}

const getAllTags = async () => {
    return await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
}

const getPosterByID = async (posterId) => {
    return await Poster.where({
        'id': parseInt(posterId)
    }).fetch({
        require: true,
        withRelated: ['tags', 'mediaproperty']
    });
}

const getAllPosters = async () => {
    return await Poster.fetchAll();
}

module.exports = {
    getAllMediaProperties, getAllTags, getPosterByID, getAllPosters
}

