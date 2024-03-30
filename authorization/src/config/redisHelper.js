const Redis = require("ioredis");

const config = require("./appConfig");

const client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
});
module.exports = {
    client
};