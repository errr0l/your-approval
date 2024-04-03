const { PARAM_POSITION_HEADER, REDIS_0, REDIS_OK, ACCESS_TOKEN, BEARER, AUTHORIZATION } = require("../constants/general");
const { ClientException } = require("../exception/index");
const { errors: oauthErrors } = require("../constants/oauth");
const { verify } = require("../util/tokenUtil");
const tokenService = require("../service/tokenService");
const { client: redisClient } = require("../config/redisHelper");

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
            console.log(ctx.request.headers);
            value = ctx.request.headers[name];
        }

        if (!value) {
            throw new ClientException({ code: oauthErrors.TOKEN_REQUIRED })
        }

        if (!value.startsWith(prefix)) {
            throw new ClientException({ code: oauthErrors.INVALID_TOKEN })
        }

        const token = value.replace(prefix, "");
        const decoded = verify(token);
        if (!decoded || (decoded.type !== ACCESS_TOKEN)) {
            throw new ClientException({ code: oauthErrors.INVALID_TOKEN });
        }
        ctx.request.tokenDecoded = decoded;
        const tokenId = decoded.tokenId;

        // 先在redis中判断，如果不存在则继续查询mysql
        if ((await redisClient.exists(tokenId)) === REDIS_0) {
            const token = await tokenService.getTokenById(decoded.tokenId);
            if (!token) {
                throw new ClientException({ code: oauthErrors.INVALID_TOKEN });
            }
            // 重新记录在redis中；
            // 重新颁发令牌时，需要把该记录删除，否则可能会出现误判；
            redisClient.set(tokenId, "1", "EX", decoded.exp).then(res => {
                if (res === REDIS_OK) {
                    console.log("redis 保存成功：token_id = %s", tokenId);
                }
                else {
                    console.log("redis 保存失败：token_id = %s", tokenId);
                }
            });
        }
        await next();
    }
}

module.exports = tokenChecker;
