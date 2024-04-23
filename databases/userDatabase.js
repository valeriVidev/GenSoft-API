const tools = require("../utility.js");

const pool = tools.mysqlPool()

  
async function registerUser(username, password) {
    const sql_query = "INSERT INTO users VALUES (?,?,?,?)";
    const [result] = await pool.query(sql_query, [null, username, password, null])
    return result
}

async function findUserByUsername(username) {
    const sql_query = "SELECT * FROM users WHERE username = (?)";
    const [result] = await pool.query(sql_query, username)
    return result
}

async function findUserByRefToken(refreshToken) {
    const sql_query = "SELECT * FROM users WHERE refresh_token = (?)";
    const [result] = await pool.query(sql_query, refreshToken)
    return result
}

async function updateByUsername(username, password) {
    const sql_query = "UPDATE users SET password = ? WHERE username = (?)";
    const [result] = await pool.query(sql_query, [password, username])
    return result
}

async function updateRefreshTokenByUsername(username, refreshToken) {
    const sql_query = "UPDATE users SET refresh_token = ? WHERE username = ?";
    const [result] = await pool.query(sql_query, [refreshToken, username])
    return result
}

async function deleteUser(username) {
    const sql_query = "DELETE FROM users WHERE username = (?)";
    const [result] = await pool.query(sql_query, [username])
    return result
  }

module.exports = {
    registerUser,
    findUserByUsername,
    updateByUsername,
    updateRefreshTokenByUsername,
    findUserByRefToken,
    deleteUser
}