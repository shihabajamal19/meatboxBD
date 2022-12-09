const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class Meal {
  constructor(title, imageUrl, fileName, price, description, adminId, id) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.fileName = fileName;
    this.price = price;
    this.description = description;
    this.adminId = adminId;
    // don't need to convert the id in controller. And if we're adding product the id field should be null
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    let dbOp;
    const db = getDb();
    if (this._id) {
      // update the meal
      // $set is for update selected Meal
      dbOp = db
      .collection('meals')
      .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection('meals').insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('meals')
      .find()
      .toArray()
      .then((meals) => {
        console.log(meals);
        return meals;
      })
      .catch((err) => console.log(err));
  }

  static findById(mealId) {
    const db = getDb();
    return db
      .collection('meals')
      .find({ _id: new mongodb.ObjectId(mealId) })
      .next()
      .then((meal) => {
        return meal;
      })
      .catch((err) => console.log(err));
  }

  static deleteById(mealId) {
    const db = getDb();
    return db
      .collection('meals')
      .deleteOne({ _id: new mongodb.ObjectId(mealId) })
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }
}

module.exports = Meal;
