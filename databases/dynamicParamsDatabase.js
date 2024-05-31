const tools = require("../utility.js");

const pool = tools.mysqlPool()

async function createParam(paramValue, type, source, paramLanguage) {
  const sql_query = "INSERT INTO dynamicParams VALUES (?,?,?,?,?)";
  const [result] = await pool.query(sql_query, [null, paramValue, type, source, paramLanguage])
  return result
}

async function checkIfParamExists(paramValue, type, source, paramLanguage) {
  const sql_query = "SELECT * FROM dynamicParams WHERE paramValue = ? AND type = ? AND source = ? AND param_language = ?";
  const [result] = await pool.query(sql_query, [paramValue, type, source, paramLanguage])
  return result
}

async function getParameterList(type, source, paramLanguage) {
  const sql_query = "SELECT paramValue FROM dynamicParams WHERE type = ? AND source = ? AND param_language = ?";
  const [result] = await pool.query(sql_query, [type, source, paramLanguage])
  return result
}

async function deleteParams(paramValue, type, source, paramLanguage) {
  const sql_query = "DELETE FROM dynamicParams WHERE paramValue = ? AND type = ? AND source = ? AND param_language = ?";
  const [result] = await pool.query(sql_query, [paramValue, type, source, paramLanguage])
  return result
}

module.exports = {
  createParam,
  checkIfParamExists,
  getParameterList,
  deleteParams
}