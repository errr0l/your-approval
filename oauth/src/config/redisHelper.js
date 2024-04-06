const { createClient } = require("../../../common/src/db/redis");
const config = require("./appConfig");

const client = createClient({
    host: config.redis.host,
    port: config.redis.port,
});

module.exports = {
    client
};