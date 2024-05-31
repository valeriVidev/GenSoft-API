/*
To reset or create the database tables for the first time,  use this script
*/
const mysql = require('mysql2')

const con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "root",
  database: "gensoft_pr",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");

  var sql =
    "CREATE TABLE users (id INT AUTO_INCREMENT, PRIMARY KEY(Id), username VARCHAR(255), password VARCHAR(255), refresh_token VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table users created");
    const userService = require("../services/userService.js")
    var dict = {
      body: {
        username: "TestUser1",
        password: "TestPassword1.",
        password_repeat: "TestPassword1."
      },
    };

    (async () => {
      try {
       let response = await userService.registerUser(dict)
       if(response !="User created."){
        console.log("Couldn't add the first user");
       }
       else{
         console.log("First user added");
       }
      } catch(e) {
       console.log('Error happend while creating the new user: ', e.message)
      }
    })();
  });

  var sql =
    "CREATE TABLE properties (id INT AUTO_INCREMENT, PRIMARY KEY(Id), property_link VARCHAR(255), property_title VARCHAR(255), property_date DATETIME, property_description  VARCHAR(255), property_body LONGTEXT, property_image VARCHAR(255), property_country VARCHAR(255), property_city VARCHAR(255), property_type VARCHAR(255), property_language VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table properties created");
  });

  var sql =
    "CREATE TABLE dynamicParams (id INT AUTO_INCREMENT, PRIMARY KEY(Id), paramValue VARCHAR(255), type VARCHAR(255), source VARCHAR(255), param_language VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table dynamicParams created");
  });

  var sql =
    "CREATE TABLE logging (id INT AUTO_INCREMENT, PRIMARY KEY(Id), logged_component VARCHAR(255), message LONGTEXT, error_sender VARCHAR(255), date_log DATETIME)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table logging created");
  });

  var sql =
    "CREATE TABLE images (id INT AUTO_INCREMENT, PRIMARY KEY(Id), image_path VARCHAR(255), source_table VARCHAR(255), item_id VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table images created");
  });
});