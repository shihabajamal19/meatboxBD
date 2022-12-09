const Order = require('../models/order');
const { validationResult } = require('express-validator/check');
const getDb = require('../util/database').getDb;


exports.fetchOrders = (req, res, next) => {
  Order.fetchAll().then((orders) => {
    res.status(200).json({
      ...orders
    });
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
};

exports.postCreateOrder = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(401).json({
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const userData = req.body.userData;
  const newUserData = { ...userData, userId: req.userId };

  const orderData = req.body.orderData;
  const totalOrderedPrice = req.body.totalOrderedPrice;
  const totalOrderedQuantity = req.body.totalOrderedQuantity;

  const order = new Order(newUserData, orderData, totalOrderedPrice, totalOrderedQuantity);

  order.save()
   return res
      .status(201)
      .json({
        message: 'Order created successfully!',
        post: {
          userData: newUserData,
          orderData: orderData,
          totalOrderedPrice,
          totalOrderedQuantity
        },
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });

};
