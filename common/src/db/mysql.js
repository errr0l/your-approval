// 数据库配置
const { createPool: cp, PoolConnection } = require("mysql2/promise");

/**
 * 创建连接池
 * @param {Object} options
 * @param {String} options.user 用户名
 * @param {String} options.password 密码
 * @param {String} options.database 数据库
 * @param {String} options.host 主机地址
 * @param {Number} options.port 端口
 * @return {Object}
 */
function createPool(options) {
    return cp({
        user: options.user,
        password: options.password,
        database: options.database,
        host: options.host,
        port: options.port
    });
}

/**
 * 执行事务；
 * 如果返回空数组，则表示出现异常；
 * @param {PoolConnection} conn 数据库连接对象
 * @param {Array} pms 执行sql语句的promise数组
 * @return {Promise<*[]>}
 */
async function executeWithTransaction(conn, pms) {
    let result = [];
    try {
        await conn.beginTransaction();
        result = await Promise.all(pms);
        await conn.commit();
    } catch (error) {
        console.error('执行事务失败：', error);
        try {
            await conn.rollback(); // 回滚事务
        } catch (rollbackError) {
            console.error('回滚失败：', rollbackError);
        }
    } finally {
        // 释放连接
        conn.release();
    }
    return result;
}

module.exports = {
    createPool, executeWithTransaction
};