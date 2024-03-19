// approval action
const AGREE = '1'; // 同意
const REJECT = '0'; // 拒绝

// oauth response type
const CODE = "code";

// 参数位置
const PARAM_POSITION_QUERY = "query";
const PARAM_POSITION_BODY = "body";

const INTERNAL_SERVER_ERROR = "Internal Server Error"; // 服务器内部错误
const UNSUPPORTED_POSITION = "unsupported position";

// token type
const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

module.exports = {
    AGREE, REJECT, CODE, ACCESS_TOKEN, REFRESH_TOKEN, INTERNAL_SERVER_ERROR,
    PARAM_POSITION_QUERY, PARAM_POSITION_BODY, UNSUPPORTED_POSITION
};