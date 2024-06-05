
// Express initialization
const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const verifyJWT = require("./middleware/verifyJWT")
const customErrors = require("./middleware/errorHandling")

const port = 3005;

// Express configuration

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://fantastic-zabaione-e18357.netlify.app"); // "Replace with: for local http://localhost:5173"
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, content-type, Accept, Authorization");
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/api/auth', require('./controllers/authRoutes'))

app.use('/api/property', require('./controllers/propertyRoutes'))
app.use('/api/dynamicParams', require('./controllers/dynamicParamRoutes'))

app.use(verifyJWT)

app.use('/api/user', require('./controllers/userRoutes'))

app.use(customErrors)

module.exports = app;