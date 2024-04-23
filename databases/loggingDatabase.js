const tools = require("../utility.js");

const pool = tools.mysqlPool()


async function createLog(loggedComponent, message, error_sender, date) {
  const sql_query = "INSERT INTO logging VALUES (?,?,?,?,?)";
  const [result] = await pool.query(sql_query, [null, loggedComponent, message, error_sender, date])
  return result
}

async function getAllLogs() {
  const sql_query = "SELECT * FROM logging";
  const [result] = await pool.query(sql_query)
  return result
}

module.exports = {
  createLog,
  getAllLogs
}