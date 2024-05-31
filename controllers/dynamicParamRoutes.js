const dynamicParamService = require("../services/dynamicParamService")
const tools = require("../utility")
const verifyJWT = require("../middleware/verifyJWT")

const express = require("express");
const router = express.Router();

const source = "dynamicParams"

// Request to create a new parameter
router.post("/create", verifyJWT, async (req, res) => {
    let result = await tools.executeRequest(dynamicParamService.createNewParam, req, source);

    if (result.hasOwnProperty("result")) res.status(201);
    else res.status(400);

    res.json(result);
});

// Request to retrieve all parameters needed for a slide
router.post("/get", async (req, res) => {
    let result = await tools.executeRequest(dynamicParamService.getParamList, req, source);

    if (result.hasOwnProperty("result")) res.status(200);
    else res.status(404);

    res.json(result);
});


// Request to delete a parameter
router.delete("/delete", verifyJWT, async (req, res) => {
    let result = await tools.executeRequest(dynamicParamService.deleteParam, req, source);

    if (result.hasOwnProperty("result")) res.status(200);
    else res.status(404);

    res.json(result);
});

module.exports = router;