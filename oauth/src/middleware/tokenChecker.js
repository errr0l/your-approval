const { PARAM_POSITION_HEADER, REDIS_OK, ACCESS_TOKEN, BEARER, AUTHORIZATION, PARAM_POSITION_BODY } = require("../../../common/src/constants/general");
const { ClientException } = require("../../../common/src/exception");
const { errors: oauthErrors } = require("../constants/oauth");
const { verify } = require("../../../common/src/util/tokenUtil");
const tokenService = require("../service/tokenService");
const { client: redisClient } = require("../config/redisHelper");
const config = require("../config/appConfig");

/**
 * token处理器；
 * 无论是access_token还是refresh_token，解析出来的token_id都是同一个
 * @param token
 * @param {Object<{ saving: Boolean, serializing: Boolean, target: String }>} opts
 * @param opts.saving 是否重新将token保存于redis
 * @param opts.serializing 是否序列化token
 * @param opts.target token类型【刷新令牌或访问令牌】
 * @return {Promise<{decoded: (Object|Null), token: *}>}
 */
async function handler(token, opts = {}) {
    const { saving = true, serializing = true, target = ACCESS_TOKEN } = opts;
    console.log('token：', token);
    console.log('secret：', config.jwt.secret);
    const decoded = verify(token, config.jwt.secret); // 该token的类型是访问令牌
    console.log('decoded：', decoded);
    if (!decoded || (decoded.type !== target)) {
        throw new ClientException({ code: oauthErrors.INVALID_TOKEN });
    }
    const tokenId = decoded.tokenId;
    // 先在redis中判断，如果不存在则继续查询mysql
    let _token;
    if (!(_token = await redisClient.get(tokenId))) {
        _token = await tokenService.getTokenById(decoded.tokenId);
        if (!_token) {
            throw new ClientException({ code: oauthErrors.INVALID_TOKEN });
        }
        if (saving) {
            redisClient.set(tokenId, JSON.stringify(_token), "EX", decoded.exp).then(res => {
                if (res === REDIS_OK) {
                    console.log("redis 保存成功：token_id = %s", tokenId);
                }
                else {
                    console.log("redis 保存失败：token_id = %s", tokenId);
                }
            });
        }
    }
    else {
        if (serializing) {
            _token = JSON.parse(_token);
        }
    }
    return { decoded, token: _token };
}

/**
 * 令牌校验中间件；
 * 从数据库中查询token记录，并匹配；
 * token解析后，会将结果保存于ctx.request对象中；
 * @param {Object} opts
 * @param opts.position
 * @param opts.name
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
        else if (position === PARAM_POSITION_BODY) {
            value = ctx.request.body[name];
        }

        if (!value) {
            throw new ClientException({ code: oauthErrors.TOKEN_REQUIRED })
        }

        if (!value.startsWith(prefix)) {
            throw new ClientException({ code: oauthErrors.INVALID_TOKEN })
        }

        const token = value.replace(prefix, "");
        const { decoded, token: _token } = await handler(token);
        ctx.request.tokenDecoded = decoded;
        ctx.request.token = _token;
        await next();
    }
}

exports.tokenChecker = tokenChecker;
exports.handler = handler;
