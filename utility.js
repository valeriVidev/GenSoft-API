const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
let loggingDb;

// Establishing database connection
function mysqlPool() {
  const pool = mysql
    .createPool({
      host: process.env.MYSQL_HOST_LOCAL,
      port: process.env.MYSQL_PORT_LOCAL,
      user: process.env.MYSQL_USER_LOCAL,
      password: process.env.MYSQL_PASSWORD_LOCAL,
      database: process.env.MYSQL_DATABASE_LOCAL,
    })
    .promise();

  return pool;
}

// Extracts current date
function currentDate() {
  let currentdate = new Date();
  let datetime =
    currentdate.getFullYear() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getDate() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes();
  return datetime;
}

// Simplified logger
async function logEntry(loggedComponent, message, error_sender = "Passed") {
  if (loggingDb === undefined) {
    loggingDb = require("./databases/loggingDatabase.js");
  }
  let date = currentDate();
  await loggingDb.createLog(loggedComponent, message, error_sender, date);
}

// Default request handler to preserve the applicaation from crashing
async function executeRequest(func, req, source) {
  let response;
  let return_error = {};
  try {
    response = await func(req);
  } catch (error) {
    return_error["error_sender"] = error.name;
    return_error["error_message"] = error.message;
    await logEntry(source, error.message, error.name);
    return return_error;
  }

  return { result: response };
}

// Removes images that got stored from a request that failed midway 
async function removeImages(headImg, support_imgs) {
  const fs = require('fs')
  imgPaths = []
  if (support_imgs != null) {
    support_imgs.forEach(path => {
      if (path["image_path"] === undefined) {
        fs.unlinkSync(path);
        imgPaths.push(path)
      }
      else {
        fs.unlinkSync(path["image_path"]);
        imgPaths.push(path["image_path"])
      }
    });
  }
  if (headImg != null) {
    fs.unlinkSync(headImg);
  }
  return imgPaths
}

module.exports = {
  currentDate,
  logEntry,
  executeRequest,
  mysqlPool,
  removeImages
};
