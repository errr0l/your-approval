// 令牌服务（对应token表）
const { pool } = require("../config/DBHelper");
// const { client } = require("../config/redisHelper");
const sqlMap = {
    delToken: "delete from `token` where `id` = ?",
    getTokenById: "select `id`, `access_token`, `refresh_token`, `scope`, `client_id`, `user_id` from `token` where `id` = ?",
    getTokensByUserId: "select `id`, `access_token`, `refresh_token`, `scope`, `client_id`, `user_id` from `token` where `user_id` = ?",
    save: "insert into `token` (`id`, `access_token`, `refresh_token`, `client_id`, `user_id`, `scope`) values (?, ?, ?, ?, ?, ?)",
};
/**
 * 获取token
 * @param {Number} id tokenId
 * @returns {Promise<*|null>}
 */
async function getTokenById(id) {
    const [rows] = await pool.query(sqlMap.getTokenById, [id]);
    return rows.length ? rows[0] : null;
}

/**
 * 根据userId获取token列表
 * @param id 用户id
 * @returns {Promise<Array>}
 */
async function getTokensByUserId(id) {
    const [rows] = await pool.query(sqlMap.getTokensByUserId, [id]);
    return rows;
}

// 删除用户token
async function delTokensByUserId(id) {
    const rows = await getTokensByUserId(id);
    if (rows.length) {
        await delToken(rows[0]);
    }
}

async function delToken(token) {
    const [result] = await pool.query(sqlMap.delToken, [token.id]);
    return result.affectedRows === 1;
}

async function update(tokenEntity) {
    const { id, accessToken, refreshToken } = tokenEntity;
    const sql = "update `token` set `access_token` = ?, `refresh_token` = ? where `id` = ?";
    const [result] = await pool.query(sql, [accessToken, refreshToken, id]);
    return result.affectedRows === 1;
}

/**
 * 保存token
 * @param {Object} tokenEntity token实体对象
 * @returns {Promise<boolean>}
 */
async function save(tokenEntity) {
    const { id, userId, clientId, accessToken, refreshToken, scope } = tokenEntity;
    const [result] = await pool.query(sqlMap.save, [id, accessToken, refreshToken, clientId, userId, scope]);
    return result.affectedRows === 1;
}

module.exports = {
    getTokenById, getTokensByUserId, save, delTokensByUserId, delToken, sqlMap, update
}