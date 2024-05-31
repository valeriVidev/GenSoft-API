const paramsDb = require("../databases/dynamicParamsDatabase")
const customErrs = require("../customErrors/customErrors")
const tools = require("../utility")

const source = "DynamicParams"
const paramOptions = ["Country", "City", "Type"]
const supported_languages = [
    "bg",
    "en"
]

// Create a new parameter
async function createNewParam(req) {
    // Parameter assignment
    const paramValue = req.body.param_value || null;
    const paramType = req.body.type || null;
    const paramSource = req.body.source || null;
    const paramLanguage = req.body.param_language || supported_languages[0]


    // Parameter check
    if (!supported_languages.includes(paramLanguage)) {
        throw new customErrs.MissingParamError("Selected language is not supported.");
    }
    if (paramSource == null || paramType == null || paramValue == null) {
        throw new customErrs.MissingParamError("Please fill in all fields to create a new parameter.");
    }

    if (paramValue.length <= 2) {
        throw new customErrs.IncorrectParamError(`Param with a value: "${paramValue}"is too short.`);
    }
    if (paramType.length <= 3) {
        throw new customErrs.IncorrectParamError(`Param with a type: "${paramType}"is too short.`);
    }
    if (!paramOptions.includes(paramType)) {
        throw new customErrs.IncorrectParamError(`Param with a type: "${paramType}"is not allowed.`);
    }

    const checkIfExists = await paramsDb.checkIfParamExists(paramValue, paramType, paramSource, paramLanguage)

    if (checkIfExists.length != 0) {
        throw new customErrs.IncorrectParamError(`Param with value: "${paramValue}" already exists with this source and type.`);
    }
    // Create a dynamic parameter
    const response = await paramsDb.createParam(
        paramValue,
        paramType,
        paramSource,
        paramLanguage
    );
    if (response['affectedRows'] != 1) {
        throw new customErrs.QueryError(`Failed in creating a param with value: "${paramValue}".`)
    }

    // Log result
    await tools.logEntry(source, `Created param with the value: "${paramValue}", type: "${paramType}" and source: "${paramSource}" in "${paramLanguage}" language`)
    return "Entry added successfully."
}

// Get needed properties
async function getParamList(req) {
    // Parameter assignment
    const paramType = req.body.type || null;
    const paramSource = req.body.source || null;
    const paramLanguage = req.body.param_language || supported_languages[0]

    // Parameter check
    if (paramSource == null || paramType == null) {
        throw new customErrs.MissingParamError("Please fill in all fields to get a parameter list.");
    }
    if (!supported_languages.includes(paramLanguage)) {
        throw new customErrs.MissingParamError("Selected language is not supported.");
    }

    // Get the list of params
    const response = await paramsDb.getParameterList(
        paramType,
        paramSource,
        paramLanguage
    );

    return response
}

async function deleteParam(req) {
    // Parameter assignment
    const paramValue = req.body.param_value || null;
    const paramType = req.body.type || null;
    const paramSource = req.body.source || null;
    const paramLanguage = req.body.param_language || supported_languages[0]

    // Parameter check
    if (paramSource == null || paramType == null || paramValue == null) {
        throw new customErrs.MissingParamError("Please fill in all fields to delete a parameter.");
    }
    if (!supported_languages.includes(paramLanguage)) {
        throw new customErrs.MissingParamError("Selected language is not supported.");
    }

    // Delete a parameter
    const response = await paramsDb.deleteParams(
        paramValue,
        paramType,
        paramSource,
        paramLanguage
    );
    if (response['affectedRows'] != 1) {
        throw new customErrs.IncorrectParamError(`Couldn't find the param with value: "${paramValue}" with source: ${paramSource} and language: "${paramLanguage}". `)
    }

    // Log the result
    await tools.logEntry(source, `Deleted param with the value: "${paramValue}", source: "${paramSource}" and "${paramLanguage}" language`)
    return "Entry deleted successfully."

}

module.exports = {
    createNewParam,
    getParamList,
    deleteParam
}
