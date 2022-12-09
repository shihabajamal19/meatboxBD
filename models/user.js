const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class User {
    constructor(name, email, password, userRole, adminRole) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.userRole = userRole || false;
        this.adminRole = adminRole || false;
    }

    save() {
        const db = getDb();
        db.collection('users')
          .insertOne(this)
          .then((result) => {
              console.log(result)
          })
          .catch((err) => console.log(err));
    }
}

module.exports = User;