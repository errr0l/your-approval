// 数据库配置
const { createPool } = require("../../../common/src/db/mysql");

const config = require("./appConfig");

// 创建连接池
const pool = createPool({
    user: config.database.user,
    password: config.database.password,
    database: config.database.db_name,
    host: config.database.host,
    port: config.database.port
});

module.exports = {
    pool
};