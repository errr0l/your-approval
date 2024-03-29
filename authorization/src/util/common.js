const querystring = require('querystring');
const crypto = require("crypto");

// 规定客户端秘钥进行编码后，在header的Authorization中传输；
// 格式为Header.Authorization = Basic base64;
function decodeClientCredentials(authorization) {
    const clientCredentials = Buffer.from(authorization.slice('Basic '.length), 'base64').toString().split(':');
    const clientId = querystring.unescape(clientCredentials[0]);
    const clientSecret = querystring.unescape(clientCredentials[1]);
    return { id: clientId, secret: clientSecret };
    // const clientCredentials = Buffer.from(authorization.slice('Basic '.length), 'base64').toString();
    // const clientSecret = querystring.unescape(clientCredentials);
    // return { secret: clientSecret };
}

function encodeWithMd5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = {
    decodeClientCredentials, encodeWithMd5
};
