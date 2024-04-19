const { pool } = require("../config/DBHelper");

/**
 * 获取客户端
 * @param id 客户端id
 * @param id
 * @returns {Promise<Object|null>}
 */
async function getClientById(id) {
    const [rows] = await pool.query("select * from `client` where `id` = ?", [id]);
    return rows.length ? rows[0] : null;
}

module.exports = {
    getClientById
}
