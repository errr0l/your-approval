// approval action
const AGREE = '1'; // 同意
const REJECT = '0'; // 拒绝

// oauth response type
const CODE = "code";

// grant type
const AUTHORIZATION_TYPE = "authorization_type";

// error
const UNSUPPORTED_RESPONSE_TYPE = "unsupported_response_type"; // 不支持传入的responseType
const ACCESS_DENIED = "access_denied"; // 用户拒绝授权
const INVALID_GRANT = "invalid_grant"; // 无效的授权
const UNSUPPORTED_GRANT_TYPE = "unsupported_grant_type";

const INTERNAL_SERVER_ERROR = "internal_server_error"; // 服务器内部错误

// token type
const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

module.exports = {
    AGREE, REJECT, CODE, ACCESS_DENIED, UNSUPPORTED_RESPONSE_TYPE, AUTHORIZATION_TYPE, INVALID_GRANT,
    UNSUPPORTED_GRANT_TYPE, ACCESS_TOKEN, REFRESH_TOKEN, INTERNAL_SERVER_ERROR
};