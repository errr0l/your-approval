// 数据库配置
const mysql = require("mysql2/promise");

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
    return mysql.createPool({
        user: options.user,
        password: options.password,
        database: options.database,
        host: options.host,
        port: options.port
    });
}

module.exports = {
    createPool
};