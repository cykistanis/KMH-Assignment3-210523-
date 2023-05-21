const express = require("express");
const router = express.Router();

// #1 import in the Poster model
const {Poster, MediaProperty, Tag} = require('../models')

// import in the CheckIfAuthenticated middleware
const { checkIfAuthenticated } = require('../middlewares');
// import in the DAL
const dataLayer = require('../dal/posters')

// import in the Forms
const { bootstrapField, createPosterForm, createSearchForm } = require('../forms');


router.get('/', checkIfAuthenticated, async (req, res) => {
  
    // 1. get all the categories
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    allMediaProperties.unshift([0, '----']);


    // 2. Get all the tags
    const allTags =  await dataLayer.getAllTags();


 
   // 3. Create search form 
    let searchForm = createSearchForm(allMediaProperties, allTags);
    let q = Poster.collection();

             

    searchForm.handle(req, {
        'empty': async (form) => {
            let posters = await q.fetch({
                withRelated: ['mediaproperty']
            })
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
                   },
        'error': async (form) => {
            let posters = await q.fetch({
                withRelated: ['mediaproperty']
            })
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
                    },
        'success': async (form) => {
           
            if (form.data.title) {
                q.where('title', 'like', '%' +form.data.title + '%')
           }

           if (form.data.mediaproperty_id && form.data.mediaproperty_id != "0"
) {
                q.where('mediaproperty_id', '=', form.data.mediaproperty_id)
           }

           if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost)
           }

           if (form.data.max_cost) {
               q = q.where('cost', '<=', form.data.max_cost);
           }
           if (form.data.min_height) {
            q.where('height', '>=', form.data.min_height)
       }

       if (form.data.max_height) {
           q = q.where('height', '<=', form.data.max_height);
       }

            if (form.data.tags) {
               q.query('join', 'posters_tags', 'posters.id', 'poster_id')
               .where('tag_id', 'in', form.data.tags.split(','))
           }


           let posters = await q.fetch({
               withRelated: ['mediaproperty']
           })
           res.render('posters/index', {
               'posters': posters.toJSON(),
               'form': form.toHTML(bootstrapField)
            })
        }
    })

})



// router.get('/', async (req,res)=>{
    
//     // #2 - fetch all the Poster (ie, SELECT * from Poster)
//     let posters = await Poster.collection().fetch({
//         withRelated:['mediaproperty', 'tags']
//     });
//     res.render('posters/index', {
//         'posters': posters.toJSON() // #3 - convert collection to JSON
//     })
// })

// router.post('/create', async (req, res) => {
//     const posterForm = createPosterForm();
//     posterForm.handle(req, {
//         'success': async (form) => {
//             const poster = new Poster();
//             poster.set('title', form.data.title);
//             poster.set('cost', form.data.cost);
//             poster.set('description', form.data.description);
//             poster.set('date', form.data.date);
//             poster.set('stock', form.data.date);
//             poster.set('height', form.data.height);
//             poster.set('width', form.data.width);
//             await poster.save();
//             res.redirect('/posters');

//         }
//     })
// })

router.get('/create',checkIfAuthenticated, async (req, res) => {
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    const allTags = await dataLayer.getAllTags();

    const posterForm = createPosterForm(allMediaProperties,allTags);
    
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', checkIfAuthenticated, async (req, res) => {
    console.log('post /create');
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    const allTags = await dataLayer.getAllTags();
    const posterForm = createPosterForm(allMediaProperties,allTags);
    posterForm.handle(req, {
        'success': async (form) => {
            let {tags, ...posterData} = form.data;
            const poster = new Poster(posterData);
            await poster.save();
            // save the many to many relationship
            if (tags) {
                await poster.tags().attach(tags.split(","));
            }
            req.flash("success_messages", `New Poster ${poster.get('title')} has been created`)

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:poster_id/update', async (req, res) => {
    // retrieve the Poster
    const posterId = req.params.poster_id
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        require: true,
        withRelated:['tags']
    });

    const allMediaProperties = await dataLayer.getAllMediaProperties();

    const allTags = await dataLayer.getAllTags();

    const posterForm = createPosterForm(allMediaProperties,allTags);

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.mediaproperty_id.value = poster.get('mediaproperty_id');
    // 1 - set the image url in the poster form
    posterForm.fields.image_url.value = poster.get('image_url');

    // fill in the multi-select for the tags
    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value= selectedTags;

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON(),
        // 2 - send to the HBS file the cloudinary information
        cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET

    })

})

router.post('/:poster_id/update', async (req, res) => {

    const allMediaProperties = await dataLayer.getAllMediaProperties();

    const allTags = await dataLayer.getAllTags();

    // fetch the Poster that we want to update
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true,
        withRelated:['tags']
    });

    // process the form
    const posterForm = createPosterForm(allMediaProperties,allTags);
    posterForm.handle(req, {
        'success': async (form) => {
            let { tags, ...posterData} = form.data;
            poster.set(posterData);
            poster.save();
            // update the tags
            
            let tagIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter( id => tagIds.includes(id) === false);
            await poster.tags().detach(toRemove);

            // add in all the tags selected in the form
            await poster.tags().attach(tagIds);
            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
    })

})

router.get('/:poster_id/delete', async(req,res)=>{
    // fetch the poster that we want to delete
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })

});

router.post('/:poster_id/delete', async(req,res)=>{
    // fetch the poster that we want to delete
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });
    await poster.destroy();
    res.redirect('/posters')
})




module.exports = router;