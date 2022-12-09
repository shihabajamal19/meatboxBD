const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');


class Order {
  constructor(userData, orderData, totalOrderedPrice, totalOrderedQuantity) {
    this.userData = userData;
    this.orderData = orderData;
    this.totalOrderedPrice = totalOrderedPrice;
    this.totalOrderedQuantity = totalOrderedQuantity;
  }

  save() {
    const db = getDb();
    db.collection('orders')
      .insertOne(this)
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('orders')
      .find()
      .toArray()
      .then((orders) => {
        console.log(orders);
        return orders;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Order;
