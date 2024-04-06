const { PARAM_POSITION_HEADER, REDIS_OK, ACCESS_TOKEN, BEARER, AUTHORIZATION } = require("../../../common/src/constants/general");
const { ClientException } = require("../../../common/src/exception");
const { errors: oauthErrors } = require("../constants/oauth");
const { verify } = require("../../../common/src/util/tokenUtil");
const tokenService = require("../service/tokenService");
const { client: redisClient } = require("../config/redisHelper");
const config = require("../config/appConfig");

/**
 * 令牌校验中间件；
 * 从数据库中查询token记录，并匹配；
 * token解析后，会将结果保存于ctx.request对象中；
 * @param {Object} opts
 * @param {String} opts.position
 * @param {String} opts.name
 * @return {(function(*, *): Promise<*>)|*}
 */
function tokenChecker(opts = {}) {
    return async function (ctx, next) {
        const { position = PARAM_POSITION_HEADER, name = AUTHORIZATION } = opts;
        const prefix = BEARER;
        let value;
        if (position === PARAM_POSITION_HEADER) {
            value = ctx.request.headers[name];
        }

        if (!value) {
            throw new ClientException({ code: oauthErrors.TOKEN_REQUIRED })
        }

        if (!value.startsWith(prefix)) {
            throw new ClientException({ code: oauthErrors.INVALID_TOKEN })
        }

        const token = value.replace(prefix, "");
        const decoded = verify(token, config.jwt.secret); // 该token的类型是访问令牌
        if (!decoded || (decoded.type !== ACCESS_TOKEN)) {
            throw new ClientException({ code: oauthErrors.INVALID_TOKEN });
        }
        ctx.request.tokenDecoded = decoded;
        const tokenId = decoded.tokenId;
        // 先在redis中判断，如果不存在则继续查询mysql
        let _token;
        if (!(_token = await redisClient.get(tokenId))) {
            _token = await tokenService.getTokenById(decoded.tokenId);
            if (!_token) {
                throw new ClientException({ code: oauthErrors.INVALID_TOKEN });
            }
            // 重新记录在redis中；
            // 重新颁发令牌时，需要把该记录删除，否则可能会出现误判；
            redisClient.set(tokenId, JSON.stringify(_token), "EX", decoded.exp).then(res => {
                if (res === REDIS_OK) {
                    console.log("redis 保存成功：token_id = %s", tokenId);
                }
                else {
                    console.log("redis 保存失败：token_id = %s", tokenId);
                }
            });
        }
        else {
            // 将json字符串转为token对象
            _token = JSON.parse(_token);
        }
        ctx.request.token = _token;
        await next();
    }
}

module.exports = tokenChecker;
