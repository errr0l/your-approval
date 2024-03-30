// 数据库配置
const mysql = require("mysql2/promise");

const config = require("./appConfig");

// 创建连接池
const pool = mysql.createPool({
    user: config.database.user,
    password: config.database.password,
    database: config.database.db_name,
    host: config.database.host,
    port: config.database.port
});

module.exports = {
    pool
};