// jwt默认采用的是对称加密
// 颁发的令牌需要签名（防篡改）
// jsonwebtoken这个库，使用最新版（9.0.2）使用公钥进行校验时，会有错误；降到8.5.1正常
const jwt = require('jsonwebtoken');
const fs = require("fs");

const config = require("../config/appConfig");
const { ACCESS_TOKEN, REFRESH_TOKEN, ID_TOKEN } = require("../constants/general");
let rsaPrimaryKey;

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

function generateIdToken(payload={}) {
    payload['type'] = ID_TOKEN;
    if (!rsaPrimaryKey) {
        rsaPrimaryKey = fs.readFileSync(config.jwt.rsa_primary_key, { encoding: 'utf-8'});
        console.log(rsaPrimaryKey);
    }
    const opts = {
        issuer: "easyums oauth",
        expiresIn: config.jwt.id_token_expires_in,
        algorithm: 'RS256'
    };
    return generate(payload, rsaPrimaryKey, opts);
}

module.exports = {
    verify, generateToken, generateRefreshToken, generateIdToken
};
