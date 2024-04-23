const userService = require("../services/userService.js")

const tools = require("../utility.js")

const express = require("express");
const router = express.Router();

const source = "User"


// Request to create a new user
router.post("/create",  async (req, res) => {
    const result = await tools.executeRequest(userService.registerUser, req, source);

    if (result.hasOwnProperty("result")) res.status(201);
    else res.status(400);

    return res.json(result);
});

// Request to get user data
router.post("/get",  async (req, res) => {
    const result = await tools.executeRequest(userService.getUser, req, source);

    if (result.hasOwnProperty("result")) res.status(200);
    else res.status(404);

    return res.json(result);
});

// Request to update the paassword
router.put("/update",  async (req, res) => {
    const result = await tools.executeRequest(userService.updatePassword, req, source);

    if (result.hasOwnProperty("result")) res.status(200);
    else res.status(400);

    return res.json(result);
});

// Request to remove a user
router.delete("/delete",  async (req, res) => {
    const result = await tools.executeRequest(userService.removeUser, req, source);

    if (result.hasOwnProperty("result")) res.status(200);
    else res.status(404);

    return res.json(result);
});

module.exports = router