const ACT_1 = '1';
const ACT_2 = '2';

// approval action
// const AGREE = ACT_1; // 同意
// const REJECT = ACT_2; // 拒绝

// oauth response type
// const CODE = "code";

// 参数位置
const PARAM_POSITION_QUERY = "query";
const PARAM_POSITION_BODY = "body";
const PARAM_POSITION_HEADER = "header";

// 参数名称（值）
const AUTHORIZATION = "authorization";
const BEARER = "bearer "

// const INTERNAL_SERVER_ERROR = "Internal Server Error"; // 服务器内部错误
// const UNSUPPORTED_POSITION = "unsupported position";

// token type
const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const ID_TOKEN = "id_token";

// redis result
const REDIS_OK = "OK";
// exists命令结果
const REDIS_0 = 0;
const REDIS_1 = 1;

module.exports = {
    ACCESS_TOKEN, REFRESH_TOKEN, ID_TOKEN, ACT_1, ACT_2, REDIS_0, REDIS_1, AUTHORIZATION, BEARER,
    PARAM_POSITION_QUERY, PARAM_POSITION_BODY, PARAM_POSITION_HEADER, REDIS_OK
};