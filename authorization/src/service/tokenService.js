// 令牌服务（对应token表）
const { pool } = require("../config/DBHelper");
const { client } = require("../config/redisHelper");

/**
 * 获取token
 * @param {Number} id tokenId
 * @returns {Promise<*|null>}
 */
async function getTokenById(id) {
    const [rows] = await pool.query("select `id`, `access_token`, `refresh_token`, `scope`, `client_id`, `user_id` from `token` where `id` = ?", [id]);
    return rows.length ? rows[0] : null;
}

/**
 * 根据clientId获取token列表
 * @param id 用户id
 * @returns {Promise<Array>}
 */
async function getTokensByUserId(id) {
    const sql = "select `id`, `access_token`, `refresh_token`, `scope`, `client_id`, `user_id` from `token` where `user_id` = ?";
    const [rows] = await pool.query(sql, [id]);
    return rows;
}

// 删除用户token
async function delTokensByUserId(id) {
    const rows = await getTokensByUserId(id);
    if (rows.length) {
        // const sql = "delete from `token` where `id` = (?)";
        // const id = rows[0].id;
        // await pool.query(sql, [id]);
        await delToken(rows[0]);
    }
}

async function delToken(token) {
    const sql = "delete from `token` where `id` = ?";
    await pool.query(sql, [token.id]);
}

/**
 * 保存token
 * @param {Object} tokenEntity token实体对象
 * @returns {Promise<boolean>}
 */
async function save(tokenEntity) {
    const { id, userId, clientId, accessToken, refreshToken, scope } = tokenEntity;
    const sql = "insert into `token` (`id`, `access_token`, `refresh_token`, `client_id`, `user_id`, `scope`) values (?, ?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [id, accessToken, refreshToken, clientId, userId, scope]);
    return result.affectedRows === 1;
}

module.exports = {
    getTokenById, getTokensByUserId, save, delTokensByUserId, delToken
}