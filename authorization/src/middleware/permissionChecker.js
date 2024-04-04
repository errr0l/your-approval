const { ClientException } = require("../exception");
const { errors } = require("../constants/oauth");

// 指的是权限范围
function permissionChecker(scope) {
    return async function (ctx, next) {
        // 即tokenChecker的解析结果；
        const token = ctx.request.token;
        if (!token || !token.scope) {
            throw new ClientException({ code: errors.ACCESS_DENIED, statusCode: 403 });
        }
        const _scopes = token.scope.split(" ");

        if (!_scopes.includes(scope)) {
            throw new ClientException({ code: errors.ACCESS_DENIED, statusCode: 403 });
        }
        ctx.request.scopes = _scopes;
        await next();
    }
}

module.exports = permissionChecker;