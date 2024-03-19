// 参数校验中间件
// 可检查query或body传输的参数，不符合预期时，将抛出异常
const { PARAM_POSITION_BODY, PARAM_POSITION_QUERY, UNSUPPORTED_POSITION } = require("../constants/general");
const { ClientException } = require("../exception/index");

function executeValidators(validators, value, rule) {
    let errors = [];
    for (let validator of validators) {
        const _errors = validator(value, rule);
        if (_errors) {
            errors.push(..._errors);
        }
    }
    return errors;
}
/**
 * 参数校验中间件
 * @param {Array<{ position: String, rules: Array<{ name: String, validators: Array<Function> }> }>} patterns 校验规则
 * @returns {(function(*, *))|*}
 */
function paramChecker(patterns) {
    return function (ctx, next) {
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
                    throw new ClientException(UNSUPPORTED_POSITION);
                }
                errors.push(...executeValidators(validators, value, rule));
            }
        }
        if (errors.length) {
            throw new ClientException(errors.map(item => item.message).join(";"));
        }
        next();
    }
}

module.exports = paramChecker;
