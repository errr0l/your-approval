const { ClientException } = require("../../../common/src/exception");
const { errors } = require("../constants/oauth");
const { CODE_403 } = require("../../../common/src/constants/general");

// 校验权限范围
function scopeChecker(scope) {
    return async function (ctx, next) {
        // 即tokenChecker的解析结果；
        const token = ctx.request.token;
        if (!token || !token.scope) {
            throw new ClientException({ code: errors.ACCESS_DENIED, statusCode: CODE_403 });
        }
        const _scopes = token.scope.split(" ");

        if (!_scopes.includes(scope)) {
            throw new ClientException({ code: errors.ACCESS_DENIED, statusCode: CODE_403 });
        }
        ctx.request.scopes = _scopes;
        await next();
    }
}

module.exports = scopeChecker;