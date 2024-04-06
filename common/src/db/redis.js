const Redis = require("ioredis");

/**
 * 创建redis客户端
 * @param {Object} options
 * @param {String} options.host 主机地址
 * @param {Number} options.port 端口
 * @returns {Object}
 */
function createClient(options) {
    return new Redis({
        host: options.host,
        port: options.port,
    });
}

module.exports = {
    createClient
};