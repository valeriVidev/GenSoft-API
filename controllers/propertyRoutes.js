const propertyService = require("../services/propertyService")
const tools = require("../utility")
const verifyJWT = require("../middleware/verifyJWT")

const express = require("express");
const router = express.Router();

const handleMultipart = require('../middleware/handleMultipartData')


const source = "Property"

// Requests start here

// Request to create a property
router.post("/create", verifyJWT, handleMultipart.any(), async (req, res) => {
  let result = await tools.executeRequest(propertyService.createNewProperty, req, source);

  if (result.hasOwnProperty("result")) res.status(201);
  else res.status(400);

  res.json(result);
});

// Request to retrieve a page of properties
router.post("/getPage", async (req, res) => {
  let result = await tools.executeRequest(propertyService.retrievePropertyPage, req, source);

  if (result.hasOwnProperty("result")) res.status(200);
  else res.status(400);

  res.json(result);
});

// Request to search for properties based on filters
router.post("/search", async (req, res) => {
  let result = await tools.executeRequest(propertyService.searchProperties, req, source);

  if (result.hasOwnProperty("result")) res.status(200);
  else res.status(400);

  res.json(result);
});

// Request to retrieve a property
router.post("/get", async (req, res) => {
  let result = await tools.executeRequest(propertyService.getProperty, req, source);

  if (result.hasOwnProperty("result")) res.status(200);
  else res.status(404);

  res.json(result);
});

// Request to retrieve a property with all its data
router.post("/getFull", verifyJWT, async (req, res) => {
  let result = await tools.executeRequest(propertyService.getFullProperty, req, source);

  if (result.hasOwnProperty("result")) res.status(200);
  else res.status(404);

  res.json(result);
});

// Request to all property names based on language
router.post("/getNames", verifyJWT, async (req, res) => {
  let result = await tools.executeRequest(propertyService.getFullNames, req, source);

  if (result.hasOwnProperty("result")) res.status(200);
  else res.status(404);

  res.json(result);
});

// Request to update a property
router.put("/update", verifyJWT, handleMultipart.any(), async (req, res) => {
  let result = await tools.executeRequest(propertyService.updateProperty, req, source);

  if (result.hasOwnProperty("result")) res.status(200);
  else res.status(400);

  res.json(result);
});

// Request to delete a property
router.delete("/delete", verifyJWT, async (req, res) => {
  let result = await tools.executeRequest(propertyService.removeProperty, req, source);

  if (result.hasOwnProperty("result")) res.status(200);
  else res.status(404);

  res.json(result);
});




module.exports = router;
