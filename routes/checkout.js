const express = require('express');
const router = express.Router();

const CartServices = require('../services/cart_services')
require('dotenv').config();
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


router.get('/', async (req, res) => {
    const cart = new CartServices(req.session.user.id);

    // get all the items from the cart
    let items = await cart.getCart();

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let i of items) {
       const lineItem = {
            'quantity': i.get('quantity'),
            'price_data': {
                'currency':'SGD',
                'unit_amount': i.related('poster').get('cost'),
                'product_data':{
                    'name': i.related('poster').get('title'),  
                }
            }
   
        }
        if (i.related('poster').get('image_url')) {
             lineItem.price_data.product_data.images = [ i.related('poster').get('image_url')];
        }
        lineItems.push(lineItem);
        // save the quantity data along with the poster id
        meta.push({
            'poster_id' : i.get('poster_id'),
            'quantity': i.get('quantity')
        })
    }

    // step 2 - create stripe payment
    let metaData = JSON.stringify(meta);
    const payment = {
        payment_method_types: ['card'],
        mode:'payment',
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        }
    }

    // step 3: register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment)
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })


})

router.get('/success', function(req,res){
    res.send("Payment succeed");
})

router.get('/error', function(req,res){
    res.send("Payment declined");
})

router.post('/process_payment', express.raw({type: 'application/json'}), async (req, res) => {
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);

    } catch (e) {
        res.send({
            'error': e.message
        })
        console.log(e.message)
    }
    if (event.type == 'checkout.session.completed') {
        let stripeSession = event.data.object;
        console.log(stripeSession);
        // process stripeSession
    }
    res.send({ received: true });
})





module.exports = router;



// const express = require('express');
// const router = express.Router();

// const CartServices = require('../services/cart_services');
// const { checkIfAuthenticated } = require('../middlewares');
// require('dotenv').config();
// const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)



// router.get('/', checkIfAuthenticated, async (req, res) => {
//     const cart = new CartServices(req.session.user.id);

//     // get all the items from the cart
//     let items = await cart.getCart();

//     // step 1 - create line items
//     let lineItems = [];
//     let meta = [];
//     for (let i of items) {
//         const lineItem = {
//             'quantity': i.get('quantity'),
//             'price_data': {
//                 'currency': 'SGD',
//                 'unit_amount': i.related('poster').get('cost'),
//                 'poster_data': {
//                     'title': i.related('poster').get('title'),
//                 }
//             }

//         }
//         if (i.related('poster').get('image_url')) {
//             lineItem.price_data.poster_data.images = [i.related('poster').get('image_url')];
//         }
//         lineItems.push(lineItem);
//         // save the quantity data along with the poster id
//         meta.push({
//             'poster_id': i.get('poster_id'),
//             'quantity': i.get('quantity')
//         })
//     }

//     // step 2 - create stripe payment
//     let metaData = JSON.stringify(meta);
//     const payment = {
//         payment_method_types: ['card'],
//         mode: 'payment',
//         line_items: lineItems,
//         success_url: "https://www.google.com",
//         cancel_url:"https://www.google.com",
//         // success_url: process.env.STRIPE_SUCCESS_URL,
//         // cancel_url: process.env.STRIPE_ERROR_URL,
//         // success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
//         // cancel_url: process.env.STRIPE_ERROR_URL,
//         metadata: {
//             'orders': metaData
//         }
//     }

//     // step 3: register the session
//     let stripeSession = await Stripe.checkout.sessions.create(payment)
//     res.render('checkout/checkout', {
//         'sessionId': stripeSession.id, // 4. Get the ID of the session
//         'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
//     })


// })

// router.get('/success', function(req,res){
//     res.send("Payment succeed");
// })

// router.get('/error', function(req,res){
//     res.send("Payment declined");
// })


// router.post("/process_payment", express.raw({type:"application/json"}) , async function(req,res){
//         const payload = req.body;  // extract the payload from req.body (i.e what stripe is sending us)
//         const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET; // use for verifying if the payload comes from Stripe
//         const sigHeader = req.headers["stripe-signature"]; // a hash of the payload using STRIPE_ENDPOINT_SECRET
//         let event = null; // to store the Stripe event (to be determined later)
//         try {
//             // determine what the event
//             event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
//             if (event.type === "checkout.session.completed") {
//                 const stripeSession = event.data.object;
//                 console.log(stripeSession);
//                 // retriving the order data
//                 const orderData = JSON.parse(stripeSession.metadata.orders);
//                 console.log(orderData);
    
//             }
//             res.status(200);
//             res.json({
//                 'message': "success"
//             })
//         } catch (e) {
//             // if there's an error when we attempt an event, we inform stripe there's an error
//             res.status(500);
//             res.json({
//                 'error': e.message
//             })
//             console.log(e.message);
//         }
    
//     });

// module.exports = router;