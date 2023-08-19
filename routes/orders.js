const express = require("express");
const router = express.Router();

// #1 import in the Poster model
const {Poster, MediaProperty, Tag, Order} = require('../models')


router.get('/', (req, res) => {
    res.render('orders');
});


router.post('/orders/create', (req, res) => {
    const { customerName, productName, quantity } = req.body;
    const order = new Order({
        customerName,
        productName,
        quantity,
    });

    order.save().then(() => {
        res.redirect('/');
    });
});

module.exports = router;