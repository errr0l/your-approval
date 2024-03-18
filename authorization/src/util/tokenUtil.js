// jwt默认采用的是对称加密
// 颁发的令牌需要签名（防篡改）
const jwt = require('jsonwebtoken');

const config = require("../config/appConfig");
const { ACCESS_TOKEN, REFRESH_TOKEN } = require("../constants/general");

/**
 * 生成令牌
 * @param {Object} payload 载荷
 * @param {String} secret 秘钥（默认在app.ini）
 * @param {Object} options 加密选项，这里使用默认配置；（https://www.npmjs.com/package/jsonwebtoken）
 * @returns {String}
 */
function generate(payload, secret, options={}) {
    return jwt.sign(payload, secret, options);
}

/**
 * 验证token
 * @param {String} token
 * @param {String} secret 秘钥
 * @returns {Object|Null}
 */
function verify(token, secret= config.jwt.secret) {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.log('令牌验证失败');
        console.log(error);
        return null;
    }
}

function generateToken(payload) {
    // 标出类型，以防止使用refresh_token当做access_token使用的问题
    payload['type'] = ACCESS_TOKEN;
    const opts = {
        issuer: "easyums oauth",
        expiresIn: config.jwt.access_token_expires_in,
    };
    return generate(payload, config.jwt.secret, opts);
}

function generateRefreshToken(payload={}) {
    payload['type'] = REFRESH_TOKEN;
    const opts = {
        issuer: "easyums oauth",
        expiresIn: config.jwt.refresh_token_expires_in,
    };
    return generate(payload, config.jwt.secret, opts);
}

module.exports = {
    generate, verify, generateToken, generateRefreshToken
};
