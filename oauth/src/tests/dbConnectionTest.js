const { createPool } = require("../../../common/src/db/mysql");



const params = {
    host: "localhost",
    port: "3306",
    user: "root",
    password: "root",
    database: "your_approval",
};
function createPool(options) {
    return cp({
        user: options.user,
        password: options.password,
        database: options.database,
        host: options.host,
        port: options.port
    });
}
// const a = {
//     user: config.database.user,
//     password: config.database.password,
//     database: config.database.db_name,
//     host: config.database.host,
//     port: config.database.port
// };
const pool = createPool(params);

console.log(pool);