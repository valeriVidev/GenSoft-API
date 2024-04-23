const userDb = require("../databases/userDatabase.js");
const customErrs = require("../customErrors/customErrors.js");
const tools = require("../utility.js");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
require("dotenv").config();

// Constants
const accessTokenExpiration = "1d"
const refreshTokenExpiration = "7d"
const source = "Auth"

async function handleLogin(req) {
  // Parameter assignment
  const username = req.body.username || false;
  const password = req.body.password || false;

  // Parameter check
  if (!username || !password)
    throw new customErrs.MissingParamError(
      "Username and password are required."
    );

    const userFound = (await userDb.findUserByUsername(username))[0] || null;

    if (userFound == null)
      throw new customErrs.MissingUserError("No user with this username exists.");  

  // Match credentials
  const match = await bcrypt.compare(password, userFound["password"]);

  // Generate access and refresh tokens
  if (match) {
    const accessToken = jwt.sign(
      { username: userFound["username"] },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: accessTokenExpiration }
    );
    const refreshToken = jwt.sign(
      { username: userFound["username"] },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: refreshTokenExpiration }
    );
    await userDb.updateRefreshTokenByUsername(
      userFound["username"],
      refreshToken
    );
    await tools.logEntry(
      source,
      `User with the username: "${username}" has logged in`
    );
    return { access_token: accessToken, refresh_token: refreshToken };
  } else {
    throw new customErrs.IncorrectParamError(
      "Incorrect password, please try again."
    );
  }
}

async function handleRefresh(req) {
  // Parameter assignment
  const cookies = req.cookies;

  // Parameter check
  if (!cookies?.jwt)
    throw new customErrs.MissingParamError("Missing appropriate cookies.");
  const refresh_token = cookies.jwt;
  let foundUser = await userDb.findUserByRefToken(refresh_token);

  if (!foundUser)
    throw new customErrs.MissingUserError("User not found, token error.");
  else foundUser = foundUser[0];

  // Refreshing theh access token with the refresh token
  let accessToken = jwt.verify(
    refresh_token,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err || foundUser["username"] !== decoded["username"])
        throw new customErrs.IncorrectParamError("Compromised token.");
      const accessToken = jwt.sign(
        { username: decoded["username"] },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: accessTokenExpiration }
      );
      return accessToken;
    }
  );
  return { access_token: accessToken };
}

async function handleLogout(req) {
  // Parameter assignment
  const cookies = req.cookies;

  // Parameter check 
  if (!cookies?.jwt) return;

  const refresh_token = cookies.jwt;
  let foundUser = await userDb.findUserByRefToken(refresh_token);

  if (!foundUser) return "cookie";
  else foundUser = foundUser[0];

  // Removes the refresh token from the user
  const response = await userDb.updateRefreshTokenByUsername(foundUser["username"], "");

  if (response['affectedRows'] == 1) {
    await tools.logEntry(source, `User "${foundUser["username"]}" has logged out`);
    return "cookie"
  }
  else {
    throw new customErrs.QueryError(`Failed in removing refresh token for user: "${foundUser["username"]}"`)
  }

}
module.exports = {
  handleLogin,
  handleRefresh,
  handleLogout
};
