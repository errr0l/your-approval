const SimpleMemoryStore = require("./SimpleMemoryStore");
const config = require("../config/appConfig");
let codeExpiresIn = +config.oauth.code_expires_in;
// let requestTTL = +config.store.request_ttl;

module.exports = {
    codeStore: new SimpleMemoryStore(codeExpiresIn, +config.store.code_limit),
    // requestStore: new SimpleMemoryStore(requestTTL, +config.store.request_limit)
}