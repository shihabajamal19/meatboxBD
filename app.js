const express = require('express');
const path = require('path');
require("dotenv").config();
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database').mongoConnect;
const helmet = require('helmet');
const compression = require('compression');
const mealsRoutes = require('./routes/meals');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const app = express();

  

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/meals', mealsRoutes);
app.use('/auth', authRoutes);
app.use('/orders', ordersRoutes);

app.use(helmet());
app.use(compression());

// error handler middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoConnect(() => {
    app.listen(process.env.PORT || 8080);
});
  