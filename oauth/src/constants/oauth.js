// oauth相关的数据
const errors = {
    // 不支持传入的responseType
    UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
    // 用户拒绝授权
    ACCESS_DENIED: 'access_denied',
    // 无效的授权
    INVALID_GRANT: 'invalid_grant',
    UNSUPPORTED_GRANT_TYPE: "unsupported_grant_type",
    UNKNOWN_CLIENT: "unknown_client",
    UNKNOWN_REQUEST: "unknown_request",
    INVALID_REQUEST: 'invalid_request',
    INVALID_CODE: "invalid_code",
    INTERNAL_SERVER_ERROR: "internal_server_error",
    INVALID_CLIENT: "invalid_client",
    INVALID_REDIRECT_URI: "invalid_redirect_uri",
    // UNSUPPORTED_POSITION: "unsupported_position",
    INVALID_TOKEN: "invalid_token",
    SERVER_BUSY: "server_busy",
    TOKEN_REQUIRED: "token_required",
    INVALID_SCOPE: "invalid_scope"
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