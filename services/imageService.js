const imageDb = require("../databases/imageDatabase")
const customErrs = require("../customErrors/customErrors.js")
const tools = require("../utility.js")
const e = require("express")
const fs = require('fs');

async function addImagesToItem(imgPaths, source, item_id) {
    // Parameter check
    if(imgPaths === null || imgPaths.length == 0){
        return []
    }

    if (source === undefined){
        throw new customErrs.MissingParamError("Source of item missing for creating an image.")
    }
    else if(item_id === undefined){
        throw new customErrs.MissingParamError("No item provided to create an image.")
    }
    // Add support images to an item
    let response = await imageDb.addImageToItem(imgPaths, source, item_id)

    // Prepare the response of the function
    if (response['affectedRows'] >= 1) {
        response = await imageDb.getImagesBySourceAndId(source, item_id)
    }
    else {
        throw new customErrs.QueryError(`Failed in adding images to id: ${item_id} with source: "${source}".`)
    }

    // Log the result
    await tools.logEntry(source, `Added images to id: ${item_id} with source: "${source}"`)
    return response
}

async function getImages(source, item_id) {
    // Parameter check
    if (source === undefined){
        throw new customErrs.MissingParamError("Source of item missing for creating an image.")
    }
    else if(item_id === undefined){
        throw new customErrs.MissingParamError("No item provided to create an image.")
    }

    // Prepare the response of the request
    response = await imageDb.getImagesBySourceAndId(source, item_id)
    if (response['affectedRows'] < 1) {
        throw new customErrs.QueryError(`Failed in retrieving images for id: ${item_id} with source: "${source}".`)
    }

    return response
}

async function deleteAllImages(source, item_id) {
    // Parameter check
    if (source === undefined){
        throw new customErrs.MissingParamError("Source of item missing for creating an image.")
    }
    else if(item_id === undefined){
        throw new customErrs.MissingParamError("No item provided to create an image.")
    }
    // Handle the removal of images from the file system
    let response = await imageDb.getImagesBySourceAndId(source, item_id) 
    if (response !== undefined || response.length != 0) {
        response.forEach(path => {
            fs.stat(path["image_path"], function (err, stats) {             
                if (err) return;
                fs.unlinkSync(path["image_path"]);
             });
        });

        let delete_response = await imageDb.deleteImagesBySourceAndId(source, item_id)
        if (delete_response['affectedRows'] === undefined ) {
            throw new customErrs.QueryError(`Failed in deleting images for id: ${item_id} with source: "${source}".`)
        }
    }
    else if(response == undefined){
        throw new customErrs.QueryError(`Failed in deleting images for id: ${item_id} with source: "${source}".`)
    }

    // Log the result
    await tools.logEntry(source, `Removed images from id: ${item_id} with source: "${source}"`)
    return response
}
async function deleteSelectedImages(imgIds, source, item_id) {
    if(imgIds === null || imgIds.length == 0){
        return []
    }

    if (source === undefined){
        throw new customErrs.MissingParamError("Source of item missing for creating an image.")
    }
    else if(item_id === undefined){
        throw new customErrs.MissingParamError("No item provided to create an image.")
    }

    let response = await imageDb.deleteSelectedImagesBySourceAndId(imgIds, source, item_id)
    if (response['affectedRows'] < 1) {
        throw new customErrs.QueryError(`Failed in deleting selected images from id: ${item_id} with source: "${source}".`)
    }
    await tools.logEntry(source, `Deleted selected images from id: ${item_id} with source: "${source}"`)
    return response
}

module.exports = {
    addImagesToItem,
    deleteAllImages,
    getImages, 
    deleteSelectedImages
}

//TODO: Understand what is happening with the image deletions and thhen finish thhe logging