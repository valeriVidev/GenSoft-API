const propertyDb = require("../databases/propertyDatabase")
const dynamicParamDb = require("../databases/dynamicParamsDatabase")
const customErrs = require("../customErrors/customErrors")
const tools = require("../utility")
const imageService = require("./imageService")
const fs = require('fs')

// Constants
const PROPERTY_BASE_LINK = '/property/';

const property_regex = new RegExp(
    "/property/[^/]+/[^/]+/$"
);

const toSlug = new RegExp(' ', "g");
const source = "Property";
const typeCountry = "Country";
const typeCity = "City";
const typeProperty = "Type";
const propertyDescriptionLength = 200;
const supported_languages = [
    "bg",
    "en"
]

async function createNewProperty(req) {
    // Parameter assignment
    const propertyTitle = req.body.property_title || null;
    const propertyBody = req.body.property_body || null;
    const propertyCountry = req.body.property_country || null;
    const propertyCity = req.body.property_city || null;
    const propertyType = req.body.property_type || null;
    const propertyLanguage = req.body.property_language || supported_languages[0]
    let propertyHeadImg = req.head_img || null;
    const propertySupportImages = req.support_img || null;

    // Parameter check
    if (propertyTitle == null) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.MissingParamError("Property title is missing.");
    }
    if (propertyBody == null) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.MissingParamError("Property body is missing.");
    }

    if (!supported_languages.includes(propertyLanguage)) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.MissingParamError("Selected language is not supported.");
    }

    const countryCheck = await dynamicParamDb.checkIfParamExists(propertyCountry, typeCountry, source, propertyLanguage)
    if (countryCheck.length == 0) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.MissingParamError(`Property country with value: "${propertyCountry}" is incorrect.`);
    }

    const cityCheck = await dynamicParamDb.checkIfParamExists(propertyCity, typeCity, source, propertyLanguage)
    if (cityCheck.length == 0) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.MissingParamError(`Property city with value: "${propertyCity}" is incorrect.`);
    }

    const typeCheck = await dynamicParamDb.checkIfParamExists(propertyType, typeProperty, source, propertyLanguage)
    if (typeCheck.length == 0) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.MissingParamError(`Property type with value: "${propertyType}" is incorrect.`);
    }

    const propertyResponse = await propertyDb.getPropertyByExactTitle(propertyTitle)
    if (propertyResponse.length != 0) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.PropertyExistsError(`Property with title: "${propertyTitle}" already exists.`);
    }

    if (propertyTitle.length <= 3) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.IncorrectParamError(`Property title: "${propertyTitle}" is too short`);
    }

    const propertySlug = propertyTitle.toLowerCase().replace(toSlug, '_')
    const propertyLink = PROPERTY_BASE_LINK + propertyLanguage + "/" + propertySlug + "/"

    if (!property_regex.test(propertyLink)) {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.IncorrectParamError(`Property link is not in the proper format. Title used: "${propertyTitle}".`);
    }

    // Creating more params
    const propertyDate = tools.currentDate();

    if (propertyHeadImg == null) {
        const full_path = __filename;
        propertyHeadImg = (full_path.split("\\services")[0]) + "\\uploads\\default.png"
    }

    let propertyDescription = "";

    if (propertyBody.length > propertyDescriptionLength) {
        propertyDescription = propertyBody.substring(0, propertyDescriptionLength) + "..."
    }
    else {
        propertyDescription = propertyBody.substring(0, propertyBody.length)
    }

    // Send the request for property creation
    let response = await propertyDb.createProperty(
        propertyLink,
        propertyTitle,
        propertyDate,
        propertyDescription,
        propertyBody,
        propertyHeadImg,
        propertyCountry,
        propertyCity,
        propertyType,
        propertyLanguage
    );

    // Prepare the response of the request
    if (response['affectedRows'] == 1) {
        response = await propertyDb.getPropertyByExactTitle(propertyTitle)
        response = response[0]
        response['property_support_images'] = await imageService.addImagesToItem(propertySupportImages, source, response['id'])
    }
    else {
        tools.removeImages(propertyHeadImg, propertySupportImages)
        throw new customErrs.QueryError(`Failed in creating a property with title: "${propertyTitle}".`)
    }

    // Log the result
    await tools.logEntry(source, `Created property with the id: "${response['id']}" and link: "${response['property_link']}"`)
    return response
}

async function retrievePropertyPage(req) {
    // Parameter assignment
    let pageOffset = req.body.offset;
    const propertyLanguage = req.body.property_language || supported_languages[0];

    // Parameter check
    if (pageOffset === undefined || typeof pageOffset !== "number") {
        pageOffset = 0;
    }
    if (!supported_languages.includes(propertyLanguage)) {
        throw new customErrs.MissingParamError("Selected language is not supported.");
    }

    // Prepare the response of the request
    const result = await propertyDb.retrieveSelectedPage(propertyLanguage, pageOffset)

    return result
}

async function searchProperties(req) {
    // Parameter assignment
    const propertyTitle = req.body.property_title || "";
    const propertyCountry = req.body.property_country || "%";
    const propertyCity = req.body.property_city || "%";
    const propertyType = req.body.property_type || "%";
    const propertyLanguage = req.body.property_language || supported_languages[0];

    // Parameter check
    if (propertyTitle != "" && propertyTitle.length < 3) {
        throw new customErrs.IncorrectParamError("Title is too short.");
    }
    if (!supported_languages.includes(propertyLanguage)) {
        throw new customErrs.MissingParamError("Selected language is not supported.");
    }

    // Prepare the response of the request
    let response = await propertyDb.searchProperties(propertyLanguage, propertyTitle, propertyCountry, propertyCity, propertyType)
    if (response.length == 0) {
        throw new customErrs.IncorrectParamError(`Couldn't find any properties with title: "${propertyTitle}".`)
    }
    else {
        // Log the result
        await tools.logEntry(source, `Requested properties with title like: "${propertyTitle}" in language: "${propertyLanguage}"`)
        return response
    }
}

async function getProperty(req) {
    // Parameter assignment
    const propertyTitle = req.body.property_title || null;
    const propertyLink = req.body.property_link || null;

    // Parameter check
    if (propertyTitle == null && propertyLink == null) {
        throw new customErrs.MissingParamError("Property title or link is missing.");
    }

    // Prepare the response of the request
    let response = await propertyDb.getPropertyByExactTitle(propertyTitle, propertyLink)
    if (response.length == 0) {
        throw new customErrs.IncorrectParamError(`Couldn't find the property with title: "${propertyTitle}" or link "${propertyLink}".`)
    }
    else {
        response = response[0]
        response['property_support_images'] = await imageService.getImages(source, response['id'])

        // Log the result
        await tools.logEntry(source, `Requested properties with title like: "${propertyTitle}"`)
        return response
    }
}

async function getFullProperty(req) {
    // Parameter assignment
    const propertyTitle = req.body.property_title || null;
    const propertyLink = req.body.property_link || null;

    // Parameter check
    if (propertyTitle == null && propertyLink == null) {
        throw new customErrs.MissingParamError("Property title or link is missing.");
    }

    // Prepare the response of the request
    let response = await propertyDb.getPropertyByExactTitleFull(propertyTitle, propertyLink)
    if (response.length == 0) {
        throw new customErrs.IncorrectParamError(`Couldn't find the property with title: "${propertyTitle}" or link "${propertyLink}".`)
    }
    else {
        response = response[0]
        response['property_support_images'] = await imageService.getImages(source, response['id'])

        // Log the result
        await tools.logEntry(source, `Requested properties with title like: "${propertyTitle}"`)
        return response
    }
}

async function getFullNames(req) {
    const propertyLanguage = req.body.property_language || supported_languages[0];

    if (!supported_languages.includes(propertyLanguage)) {
        throw new customErrs.MissingParamError("Selected language is not supported.");
    }

    const result = await propertyDb.getFullPropertyNames(propertyLanguage)
    return result
}

async function updateProperty(req) {
    // Parameter assignment
    const propertyTitle = req.body.property_title || null;
    const propertyTitleNew = req.body.property_title_new || null;
    const propertyBody = req.body.property_body || null;
    const propertyCountry = req.body.property_country || null;
    const propertyCity = req.body.property_city || null;
    const propertyType = req.body.property_type || null;
    const propertyLanguage = req.body.property_language || null;
    let propertyHeadImg = req.head_img || null;
    const propertySupportImages = req.support_img || null;
    let toRemoveHeadImg = null;
    let toRemoveSupImg = [];

    // Parameter check
    if (propertyTitle == null) {
        tools.removeImages(propertyHeadImg, propertySupportImages);
        throw new customErrs.MissingParamError("Property title is missing.");
    }
    if (propertyBody == null && propertyTitleNew == null && propertyCountry == null && propertyCity == null && propertyType == null) {
        tools.removeImages(propertyHeadImg, propertySupportImages);
        throw new customErrs.IncorrectParamError("Nothing to update.");
    }

    let propertyResponse = await propertyDb.getPropertyByExactTitleFull(propertyTitle)

    if (propertyResponse.length == 0) {
        tools.removeImages(propertyHeadImg, propertySupportImages);
        throw new customErrs.IncorrectParamError(`Property with title "${propertyTitle}" could not be found.`);
    }
    else {
        propertyResponse = propertyResponse[0]
    }

    if (propertyLanguage != null) {
        if (!supported_languages.includes(propertyLanguage)) {
            tools.removeImages(propertyHeadImg, propertySupportImages)
            throw new customErrs.MissingParamError("Selected language is not supported.");
        }
        propertyResponse["property_language"] = propertyLanguage
    }

    // Assigning more params and checking their validity
    if (propertyCountry != null) {
        const countryCheck = await dynamicParamDb.checkIfParamExists(propertyCountry, typeCountry, source, propertyResponse["property_language"])
        if (countryCheck.length == 0) {
            tools.removeImages(propertyHeadImg, propertySupportImages)
            throw new customErrs.IncorrectParamError(`Property country with value: "${propertyCountry}" in language: "${propertyResponse["property_language"]}" is incorrect.`);
        }
        propertyResponse["property_country"] = propertyCountry
    }

    if (propertyCity != null) {
        const cityCheck = await dynamicParamDb.checkIfParamExists(propertyCity, typeCity, source, propertyResponse["property_language"])
        if (cityCheck.length == 0) {
            tools.removeImages(propertyHeadImg, propertySupportImages)
            throw new customErrs.IncorrectParamError(`Property city with value: "${propertyCity}" in language: "${propertyResponse["property_language"]}" is incorrect.`);
        }
        propertyResponse["property_city"] = propertyCity
    }

    if (propertyType != null) {
        const typeCheck = await dynamicParamDb.checkIfParamExists(propertyType, typeProperty, source, propertyResponse["property_language"])
        if (typeCheck.length == 0) {
            tools.removeImages(propertyHeadImg, propertySupportImages)
            throw new customErrs.IncorrectParamError(`Property type with value: "${propertyType}" in language: "${propertyResponse["property_language"]}" is incorrect.`);
        }
        propertyResponse["property_type"] = propertyType
    }

    if (propertyTitleNew != null) {
        if (propertyTitleNew.length < 3) {
            tools.removeImages(propertyHeadImg, propertySupportImages);
            throw new customErrs.IncorrectParamError(`Updated property title: "${propertyTitleNew}" is too short.`)
        }

        const newTitleCheck = await propertyDb.getPropertyByExactTitle(propertyTitleNew);
        if (newTitleCheck.length != 0) {
            tools.removeImages(propertyHeadImg, propertySupportImages);
            throw new customErrs.PropertyExistsError(`Property with title "${propertyTitleNew}" already exists.`);
        }

        propertyResponse["property_title"] = propertyTitleNew
        const propertySlug = propertyTitleNew.toLowerCase().replace(toSlug, '_');
        const propertyLinkNew = PROPERTY_BASE_LINK + propertyResponse["property_language"] + "/" + propertySlug + "/";
        propertyResponse['property_link'] = propertyLinkNew;
    }

    if (propertyBody != null) {
        propertyResponse["property_body"] = propertyBody;
    }

    if (propertyHeadImg != null) {
        toRemoveHeadImg = propertyResponse["property_image"];
        propertyResponse["property_image"] = propertyHeadImg;
    }

    if (propertySupportImages != null) {
        current_property_images = await imageService.getImages(source, propertyResponse['id']);
        current_property_images.forEach(image => {
            if (!propertySupportImages.includes(image)) {
                toRemoveSupImg.push(image);
            }
        });
    }

    if (propertyBody != null) {
        if (propertyBody.length > propertyDescriptionLength) {
            propertyResponse["property_description"] = propertyBody.substring(0, propertyDescriptionLength) + "...";
        }
        else {
            propertyResponse["property_description"] = propertyBody.substring(0, propertyBody.length);
        }
    }

    // Prepare the response of the request
    let response = await propertyDb.updatePropertyByTitle(propertyResponse, propertyTitle);

    if (response['affectedRows'] == 1) {
        pathsToRemoveFromDb = await tools.removeImages(toRemoveHeadImg, toRemoveSupImg);
        response = await propertyDb.getPropertyByExactTitle(propertyResponse["property_title"]);
        response = response[0];
        await imageService.deleteSelectedImages(pathsToRemoveFromDb, source, response['id']);
        await imageService.addImagesToItem(propertySupportImages, source, response['id']);
        response['property_support_images'] = await imageService.getImages(source, response['id']);
    }
    else {
        tools.removeImages(propertyHeadImg, propertySupportImages);
        throw new customErrs.QueryError(`Failed in updating property with id: "${username}".`);
    }

    // Log the result
    await tools.logEntry(source, `Updated property with id: "${response['id']}" and link: "${response['property_link']}"`);
    return response;
}

async function removeProperty(req) {
    // Parameter assignment
    const propertyId = req.body.property_id || null;

    // Parameter check
    if (propertyId == null) {
        throw new customErrs.MissingParamError(`Property with id: "${propertyId}" not found.`);
    }
    let property = await propertyDb.getPropertyById(propertyId)
    if (property.length != 0) {
        property = property[0]
    }
    else {
        throw new customErrs.QueryError(`Couldn't retrieve property with id: "${propertyId}".`)
    }
    // Prepare the response of the request
    const result = await propertyDb.deleteProperty(propertyId)
    if (result['affectedRows'] == 1) {
        // Resolve the removal of images
        if (property["property_image"] !== undefined) {
            fs.stat(property["property_image"], function (err, stats) {
                if (err) return;
                if (!property["property_image"].includes("default.png")) {
                    fs.unlinkSync(property["property_image"]);
                }
            });
        }
        else {
            throw new customErrs.IncorrectParamError(`Incorrect image parameter.`);
        }
        await imageService.deleteAllImages(source, propertyId)

        // Log the result
        await tools.logEntry(source, `Deleted property with id: "${propertyId}"`)
        return "Property deleted successfully."
    }
    else {
        throw new customErrs.QueryError(`Failed in deleting property with id: "${propertyId}".`)
    }
}

module.exports = {
    removeProperty,
    updateProperty,
    getProperty,
    getFullProperty,
    getFullNames,
    retrievePropertyPage,
    searchProperties,
    createNewProperty
}