const tools = require("../utility.js");

const pool = tools.mysqlPool()

async function addImageToItem(imgPaths, source, item_id) {
    const sql_query = "INSERT INTO images (id, image_path, source_table, item_id) VALUES ?";
    const [result] = await pool.query(sql_query, [imgPaths.map(path => [null, path, source, item_id])])
    return result
}

async function getImagesBySourceAndId(source, item_id) {
    const sql_query = "SELECT image_path FROM images WHERE source_table = (?) and item_id = (?)";
    const [result] = await pool.query(sql_query, [source, item_id])
    return result
}

async function deleteImagesBySourceAndId(source, item_id) {
    const sql_query = "DELETE FROM images WHERE source_table = (?) and item_id = (?)";
    const [result] = await pool.query(sql_query, [source, item_id])
    return result
}

async function deleteSelectedImagesBySourceAndId(imgPaths, source, item_id) {
    const sql_query = "DELETE FROM images WHERE image_path IN (?) AND source_table = (?) AND item_id = (?)";
    const [result] = await pool.query(sql_query, [imgPaths, source, item_id])
    return result
}

module.exports = {
    addImageToItem,
    getImagesBySourceAndId,
    deleteImagesBySourceAndId,
    deleteSelectedImagesBySourceAndId
}