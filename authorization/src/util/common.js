const querystring = require('querystring');

function decodeClientCredentials(authorization) {
    const clientCredentials = Buffer.from(authorization.slice('basic '.length), 'base64').toString().split(':');
    const clientId = querystring.unescape(clientCredentials[0]);
    const clientSecret = querystring.unescape(clientCredentials[1]);
    return { id: clientId, secret: clientSecret };
}

module.exports = {
    decodeClientCredentials
};
