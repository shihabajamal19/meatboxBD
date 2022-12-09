const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongodb = require('mongodb');

const User = require('../models/user');
const getDb = require('../util/database').getDb;

exports.userSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const userRole = req.body.userRole;
  const adminRole = req.body.adminRole || false;

  const db = getDb();

  db.collection('users')
    .findOne({ email: email })
    .then((user) => {

      // if E-Mail address already exists!
      if (user) {
        console.log(user)
        if (user.adminRole) {
          const error = new Error(
            'You are already admin. Please login with your old credentials'
          );
          error.statusCode = 401;
          throw error;
        }

        const error = new Error('E-Mail address already exists! ');
        error.statusCode = 401;
        throw error;
      }

      if (!user) {
        bcrypt
          .hash(password, 12)
          .then((hashedpw) => {
            const user = new User(name, email, hashedpw, userRole, adminRole);
            user.save();
          })
          .then(() => {
            res.status(201).json({ message: 'User created!' });
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.userLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body)
  let loadedUser;

  const db = getDb();

  db.collection('users')
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
          adminRole: false
        },
        process.env.accessTokenSecret,
        { expiresIn: '24h' }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString(), email: email, name: loadedUser.name });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


exports.adminSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const userRole = req.body.userRole || false;
  const adminRole = req.body.adminRole;

  const db = getDb();

  db.collection('users')
    .findOne({ email: email })
    .then((user) => {
      // if E-Mail address already exists!
      if (user) {
        if (user.userRole && !user.adminRole) {
          return user
        }

        const error = new Error('E-Mail address already exists in admin role! ');
        error.statusCode = 401;
        throw error;
      }

      if (!user) {
        bcrypt
          .hash(password, 12)
          .then((hashedpw) => {
            const user = new User(name, email, hashedpw, userRole, adminRole);
            user.save();
          })
          .then(() => {
            res.status(201).json({ message: 'User created!' });
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      }
    })
    .then(user => {
      if(user) {

        const hashedPassword =  bcrypt.hash(password, 12)
  
        db.collection('users')
        .updateOne({email: user.email}, { $set: {name: name, password: hashedPassword, adminRole: true}})
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


exports.adminLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  const db = getDb();

  db.collection('users')
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }

      if(!user.adminRole) {
        const error = new Error('You don\'t have admin role');
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
          adminRole: true
        },
        process.env.accessTokenSecret,
        { expiresIn: '24h' }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString(), name: loadedUser.name });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

