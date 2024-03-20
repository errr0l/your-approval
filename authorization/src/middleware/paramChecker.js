// 参数校验中间件
// 可检查query或body传输的参数，不符合预期时，将抛出异常
const { PARAM_POSITION_BODY, PARAM_POSITION_QUERY, UNSUPPORTED_POSITION } = require("../constants/general");
const { ClientException, CustomException } = require("../exception/index");

async function executeValidators(validators, value, rule, ctx) {
    let errors = [];
    for (let validator of validators) {
        const _errors = await validator(value, rule, ctx);
        if (_errors) {
            errors.push(..._errors);
        }
    }
    return errors;
}
/**
 * 参数校验中间件
 * @param {Array<{ position: String, rules: Array<{ name: String, validators: Array<Function> }> }>} patterns 校验规则
 * @param {Function} errorHandler 错误处理；可以选择自己实现错误处理的规则；
 * @returns {(function(*, *))|*}
 */
function paramChecker(patterns, errorHandler) {
    return async function (ctx, next) {
        const query = ctx.request.query;
        const body = ctx.request.body;
        const errors = [];
        for (let pattern of patterns) {
            const { position, rules } = pattern;
            for (let rule of rules) {
                const { name, validators } = rule;
                let value;
                if (position === PARAM_POSITION_QUERY) {
                    value = query[name];
                }
                else if (position === PARAM_POSITION_BODY) {
                    value = body[name];
                }
                else {
                    throw new CustomException({ message: UNSUPPORTED_POSITION });
                }
                errors.push(...(await executeValidators(validators, value, rule, ctx)));
            }
        }
        if (errors.length) {
            if (typeof errorHandler == 'function') {
                errorHandler(errors, ctx);
            }
            throw new ClientException({ message: errors.map(item => item.message).join(";") });
        }
        // don't forget to call next();
        // and call it with 'await` if the function is a AsyncFunction, or else a 404 error will be caused;
        await next();
    }
}

module.exports = paramChecker;
