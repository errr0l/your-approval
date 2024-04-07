// 参数校验中间件
// 可检查query或body传输的参数，不符合预期时，将抛出异常
const { PARAM_POSITION_BODY, PARAM_POSITION_QUERY, PARAM_POSITION_HEADER, UNSUPPORTED_POSITION } = require("../constants/general");
const { ClientException } = require("../exception/index");

/**
 * 参数校验中间件
 * @param {Array<{ position: String, rules: Array<{ name: String, required: Boolean, validator: Function }> }>} patterns 校验规则
 * @param {Object} opts
 * @param opts.errorHandler 错误处理；可以选择自己实现错误处理的规则；
 * @param opts.errorCode 错误码
 * @returns {(function(*, *))|*}
 */
function paramChecker(patterns, opts= {}) {
    return async function (ctx, next) {
        const { errorHandler, errorCode = "" } = opts;
        const query = ctx.request.query;
        const body = ctx.request.body;
        const headers = ctx.request.headers;
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
                    value = headers[name];
                }
                else {
                    throw new ClientException({ code: errorCode, message: UNSUPPORTED_POSITION });
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
                        // 也可以通过自行在validator中抛出异常，此时异常会被外部的[try... catch...]捕获
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
            if (errorHandler && typeof errorHandler == 'function') {
                errorHandler(errors, ctx);
            }
            throw new ClientException({ code: errorCode, message: errors.join(";") });
        }
        // don't forget to call next() with 'await`, or else a 404 error will be caused;
        await next();
    }
}

module.exports = paramChecker;
