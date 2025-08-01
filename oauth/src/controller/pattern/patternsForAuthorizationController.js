// 以模块区分
const { ACT_1, ACT_2, PARAM_POSITION_BODY, PARAM_POSITION_HEADER, PARAM_POSITION_QUERY, AUTHORIZATION } = require("../../../../common/src/constants/general");
const { responseTypes, grantTypes } = require("../../constants/oauth");
const config = require("../../config/appConfig");
const { openidRule } = require("../../../../common/src/util/oidcUtil");
const emailRule = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/;
const { scopes: oidcScopes } = require("../../../../common/src/constants/oidc");

// 当然，不以这种方式来校验也是可以的，只是说使用这种校验形式可以使得业务代码更集中;
// 重新考虑了一下，虽然js可以轻易做到在任何地方做校验，但其他语言可能不行，所以有些校验应该放在业务层，这里只校验一些静态规则；
const authorize = [{
    position: PARAM_POSITION_QUERY,
    rules: [{
        name: "response_type",
        validator: (value, _this, ctx) => {
            let errors = [];
            if (!value) {
                errors.push(_this.name + "不能为空");
            }
            else {
                let matched = false;
                for (let key in responseTypes) {
                    if (value === responseTypes[key]) {
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    errors.push(_this.name + "格式错误");
                }
            }
            return errors;
        }
    }, {
        name: "redirect_uri",
        required: true,
    }, {
        name: "client_id",
        required: true,
    }, {
        name: "scope",
        validator(value, _this, ctx) {
            let errors = [];
            if (!value) {
                errors.push("权限范围不能为空");
            }
            else {
                value = value.trim();
                let containedOpenid = false;
                const _scopes = value.split(" ");
                for (let _scope of _scopes) {
                    if (!containedOpenid && (_scope === oidcScopes.OPENID)) {
                        containedOpenid = true;
                        break;
                    }
                }
                // 如果使用了oidc，则必须包含openid
                if (openidRule.test(value) && !containedOpenid) {
                    errors.push("缺少openid权限范围");
                }
                ctx.request._scopes = _scopes; // 申请的权限
                ctx.request._containedOpenid = containedOpenid; // 这个值只能说明客户端申请的时候，有openid；用户可以不授权，比如，openidRule一个都不选
            }
            return errors;
        }
    }]
}];

// const approve = [{
//     position: PARAM_POSITION_BODY,
//     rules: [{
//         name: "uuid",
//         required: true,
//     }, {
//         name: "action",
//         validator(value, _this, ctx) {
//             let errors = [];
//             if (!value) {
//                 errors.push(this.name + "不能为空");
//             }
//             else {
//                 if (value !== ACT_1 && value !== ACT_2) {
//                     errors.push(this.name + "格式错误")
//                 }
//             }
//             return errors;
//         }
//     }]
// }];

const token = [{
    position: PARAM_POSITION_BODY,
    rules: [{
        name: "grant_type",
        required: true,
        validator(value, _this, ctx) {
            if (value) {
                let matched = false;
                for (const key in grantTypes) {
                    if (value === grantTypes[key]) {
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    return this.name + "格式错误";
                }
            }
        }
    }, {
        name: "code",
        required: true,
    }, {
        name: "redirect_uri",
        required: true,
    }, {
        name: "client_id",
        required: true,
    }]
}, {
    position: PARAM_POSITION_HEADER,
    rules: [{
        name: AUTHORIZATION,
        required: true,
    }]
}];

const authenticate = [{
    position: PARAM_POSITION_BODY,
    rules: [{
        name: "username",
        required: true,
    }, {
        name: "password",
        required: true,
    }, {
        name: "query",
        required: true,
    }]
}];

const register = [{
    position: PARAM_POSITION_BODY,
    rules: [{
        name: "username",
        required: true,
    }, {
        name: "password",
        required: true,
    }, {
        name: "password2",
        validator(value, _this, ctx) {
            const errors = [];
            if (!value) {
                errors.push(this.name + "不能为空");
            }
            else {
                if (value !== ctx.request.body.password) {
                    errors.push("输入密码不一致");
                }
            }
            return errors;
        }
    }, {
        name: "email",
        required: true,
        validator(value, _this, ctx) {
            const errors = [];
            if (!value) {
                errors.push(this.name + "不能为空");
            }
            else {
                if (!emailRule.test(value)) {
                    errors.push("邮箱格式不正确");
                }
            }
            return errors;
        }
    }, {
        name: "code",
        required: true
    }]
}];

const verify = [{
    position: PARAM_POSITION_BODY,
    rules: [{
        name: "token",
        required: true
    }]
}];

const revoke = [{
    position: PARAM_POSITION_BODY,
    rules: [{
        name: "credential",
        required: true
    }]
}];

module.exports = {
    authorize: authorize, // approve: approve, 
    token: token, authenticate: authenticate, register: register, emailRule,
    verify, revoke
}
