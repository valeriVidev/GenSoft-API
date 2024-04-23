const authService = require("../services/authService.js")
const tools = require("../utility.js")
const express = require("express");
const router = express.Router();

const source = "Auth";

// Request to login and generate an access and refresg tokens
router.post("/login", async (req, res) => {
    let result = await tools.executeRequest(authService.handleLogin, req, source);

    if (result.hasOwnProperty("result")){ 
        const refreshToken = result["result"]["refresh_token"]
        delete result["result"]["refresh_token"]
        res.status(200);
        //We will skip the refresh token for now, however it is implemented, the issue is getting it to appear on the server
        //res.cookie('refresh_token', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'none', secure: true}) // sameSite: true, secure: true /see if needed
    }
    else res.status(401);

    return res.json(result);
});

// Request to refresh the access token
router.post("/refresh", async (req, res) => {
    let result = await tools.executeRequest(authService.handleRefresh, req, source);

    if (result.hasOwnProperty("result")) res.status(200);
    else res.status(403);

    return res.json(result);
});

// Request to delete the refresh token from the database
router.post("/logout", async (req, res) => {
    let result = await tools.executeRequest(authService.handleLogout, req, source);

    if (result.hasOwnProperty("result") && result["result"] === "cookie") {
        res.clearCookie('jwt', {httpOnly: true}); // sameSite: true, secure: true /see if needed
    }
    else if(result.hasOwnProperty("error_message")) return res.status(400).json(result); 
    return res.sendStatus(204)

});
module.exports = router