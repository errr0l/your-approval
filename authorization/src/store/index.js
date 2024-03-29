
const SimpleMemoryStore = require("./SimpleMemoryStore");
const config = require("../config/appConfig");
let codeExpiresIn = +config.oauth.code_expires_in;
let requestTTL = +config.server.request_ttl;

module.exports = {
    codeStore: new SimpleMemoryStore(codeExpiresIn),
    requestStore: new SimpleMemoryStore(requestTTL)
}