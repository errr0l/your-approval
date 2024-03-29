// 参数校验中间件
// 可检查query或body传输的参数，不符合预期时，将抛出异常
const { PARAM_POSITION_BODY, PARAM_POSITION_QUERY, PARAM_POSITION_HEADER } = require("../constants/general");
const { ClientException, CustomException } = require("../exception/index");
const { errors: oauthErrors } = require("../constants/oauth");

/**
 * 参数校验中间件
 * @param {Array<{ position: String, rules: Array<{ name: String, required: Boolean, validator: Function }> }>} patterns 校验规则
 * @param {Function} errorHandler 错误处理；可以选择自己实现错误处理的规则；
 * @returns {(function(*, *))|*}
 */
function paramChecker(patterns, errorHandler) {
    return async function (ctx, next) {
        const query = ctx.request.query;
        const body = ctx.request.body;
        let headers;
        const errors = [];
        for (let pattern of patterns) {
            const { position, rules } = pattern;
            for (let rule of rules) {
                const { name, validator, required } = rule;
                let value;
                if (position === PARAM_POSITION_QUERY) {
                    value = query[name];
                }
                else if (position === PARAM_POSITION_BODY) {
                    value = body[name];
                }
                else if (position === PARAM_POSITION_HEADER) {
                    if (!headers) {
                        headers = ctx.request.headers;
                    }
                    value = headers[name];
                }
                else {
                    throw new CustomException({ message: oauthErrors.UNSUPPORTED_POSITION });
                }
                if (required) {
                    if (typeof value == 'string') {
                        value = value.trim();
                    }
                    if (!value) {
                        errors.push(name + '不能为空');
                    }
                }
                if (typeof validator == 'function') {
                    try {
                        const _error = await rule.validator(value, rule, ctx);
                        // 目前只处理两种类型，一种是Array<String>，另一个是String；
                        // 也可以通过异常返回错误消息；
                        if (Array.isArray(_error)) {
                            errors.push(..._error);
                        }
                        else if (typeof _error == 'string') {
                            errors.push(_error);
                        }
                    } catch (error) {
                        errors.push(error.message);
                    }
                }
            }
        }
        if (errors.length) {
            if (typeof errorHandler == 'function') {
                errorHandler(errors, ctx);
            }
            throw new ClientException({ message: errors.join(";") });
        }
        // don't forget to call next();
        // and call it with 'await` if the function is a AsyncFunction, or else a 404 error will be caused;
        await next();
    }
}

module.exports = paramChecker;
