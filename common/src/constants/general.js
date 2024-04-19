// 表示表单的动作
const ACT_1 = '1';
const ACT_2 = '2';

// 参数位置
const PARAM_POSITION_QUERY = "query";
const PARAM_POSITION_BODY = "body";
const PARAM_POSITION_HEADER = "header";

// 参数名称（值）
const AUTHORIZATION = "authorization";
const BEARER = "Bearer "

// token type
const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const ID_TOKEN = "id_token";

// redis result
const REDIS_OK = "OK";
// exists命令结果
const REDIS_0 = 0;
const REDIS_1 = 1;

// redis前缀
const EASYUMS_PREFIX = "EASYUMS_";
const EASYUMS_EMAIL_PREFIX = `${EASYUMS_PREFIX}EMAIL_`;

module.exports = {
    ACCESS_TOKEN, REFRESH_TOKEN, ID_TOKEN, ACT_1, ACT_2, REDIS_0, REDIS_1, AUTHORIZATION, BEARER,
    PARAM_POSITION_QUERY, PARAM_POSITION_BODY, PARAM_POSITION_HEADER, REDIS_OK, EASYUMS_PREFIX, EASYUMS_EMAIL_PREFIX,
    BAD_REQUEST: "bad request",
    INTERNAL_SERVER_ERROR: "internal server error",
    UNSUPPORTED_POSITION: "unsupported position",
    CODE_200: 200,
    CODE_400: 400,
    CODE_403: 403,
    CODE_500: 500,
    SESSION_TOKEN: "session_token", // (easyums-oauth)与session_id类似，但过期时间较长，其属性值保存与redis中
    MESSAGE_1: 'ok'
};