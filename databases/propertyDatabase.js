const tools = require("../utility.js");

const pool = tools.mysqlPool()

const pageSize = 6

async function createProperty(propertyLink, propertyTitle, propertyDate, propertyDescription, propertyBody, propertyImage, propertyCountry, propertyCity, propertyType, propertyLanguage) {
    const sql_query = "INSERT INTO properties VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    const [result] = await pool.query(sql_query, [null, propertyLink, propertyTitle, propertyDate, propertyDescription, propertyBody, propertyImage, propertyCountry, propertyCity, propertyType, propertyLanguage])
    return result
}

async function getPropertyByExactTitle(propertyTitle, propertyLink = null) {
    const sql_query = "SELECT id, property_link, property_title, property_date, property_body, property_image FROM properties WHERE property_title = ? OR property_link = ?";
    const [result] = await pool.query(sql_query, [propertyTitle, propertyLink])
    return result
}

async function getPropertyByExactTitleFull(propertyTitle, propertyLink = null) {
    const sql_query = "SELECT * FROM properties WHERE property_title = ? OR property_link = ?";
    const [result] = await pool.query(sql_query, [propertyTitle, propertyLink])
    return result
}

async function getFullPropertyNames(propertyLanguage) {
    const sql_query = "SELECT property_title FROM properties WHERE property_language = ? ORDER BY property_title";
    const [result] = await pool.query(sql_query, [propertyLanguage])
    return result
}

async function retrieveSelectedPage(propertyLanguage, offset) {
    const sql_query = `SELECT id, property_link, property_title, property_date, property_description, property_image FROM properties WHERE property_language = ? ORDER BY property_date desc LIMIT ${pageSize} OFFSET ?`;
    const [result] = await pool.query(sql_query, [propertyLanguage, offset])
    return result
}

async function searchProperties(propertyLanguage, propertyTitle, propertyCountry, propertyCity, propertyType) {
    propertyTitle = "%" + propertyTitle + "%"
    const sql_query = "SELECT id, property_link, property_title, property_date, property_description, property_image FROM properties WHERE property_language = ? AND property_title like ? AND property_country like ? AND property_city like ? AND property_type like ?";
    const [result] = await pool.query(sql_query, [propertyLanguage, propertyTitle, propertyCountry, propertyCity, propertyType])
    return result
}

async function updatePropertyByTitle(data, propertyTitle) {
    const sql_query = "UPDATE properties SET property_link = ?, property_title = ?, property_description = ?, property_body = ?, property_image = ?, property_country = ?, property_city = ?, property_type = ?, property_language = ? WHERE property_title = ?";
    const [result] = await pool.query(sql_query, [data['property_link'], data['property_title'], data["property_description"], data["property_body"], data["property_image"], data["property_country"], data["property_city"], data["property_type"], data["property_language"], propertyTitle])
    return result
}

async function getPropertyById(articleId) {
    const sql_query = "SELECT * FROM properties WHERE id = ?";
    const [result] = await pool.query(sql_query, [articleId])
    return result
}

async function deleteProperty(articleId) {
    const sql_query = "DELETE FROM properties WHERE id = ?";
    const [result] = await pool.query(sql_query, [articleId])
    return result
}

module.exports = {
    createProperty,
    getPropertyByExactTitle,
    retrieveSelectedPage,
    searchProperties,
    getPropertyByExactTitleFull,
    getFullPropertyNames,
    updatePropertyByTitle,
    deleteProperty,
    getPropertyById
}