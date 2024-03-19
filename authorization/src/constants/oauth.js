// const UNSUPPORTED_RESPONSE_TYPE = "unsupported_response_type"; // 不支持传入的responseType
// const ACCESS_DENIED = "access_denied"; // 用户拒绝授权
// const INVALID_GRANT = "invalid_grant"; // 无效的授权
// const UNSUPPORTED_GRANT_TYPE = "unsupported_grant_type";
// const UNKNOWN_CLIENT = "unknown_client";
// const UNKNOWN_REQUEST = "unknown_request";

const errors = {
    // 不支持传入的responseType
    UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
    // 用户拒绝授权
    ACCESS_DENIED: 'access_denied',
    // 无效的授权
    INVALID_GRANT: 'invalid_grant',
    UNSUPPORTED_GRANT_TYPE: "unsupported_grant_type",
    UNKNOWN_CLIENT: "unknown_client",
    UNKNOWN_REQUEST: "unknown_request"
};

const grantTypes = {
    AUTHORIZATION_TYPE: "authorization_type"
};

const responseTypes = {
    CODE: "code",
    TOKEN: "token",
    ID_TOKEN: "id_token"
};

module.exports = { errors, grantTypes, responseTypes };