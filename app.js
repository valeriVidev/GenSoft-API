
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
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/api/auth', require('./controllers/authRoutes'))

app.use(verifyJWT)

app.use('/api/user', require('./controllers/userRoutes'))

app.use(customErrors)

app.listen(port, () => console.log(`App listening on port ${port}!`));



























// const business_regex = new RegExp(
//   "https://capitalplusbrokers.com/business/[^/]+/$"
// );
