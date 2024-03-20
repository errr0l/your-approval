// 以模块区分
const { responseTypes, errors: authErrors } = require("../../constants/oauth");
const clientService = require("../../service/clientService");
const { checkRequest } = require("../../util/tempStoreForRequest");
const { AGREE, REJECT } = require("../../constants/general");

// 当然，不以这种方式来校验也是可以的
const patternsForAuthorize = [{
    position: "query",
    rules: [{
        name: "response_type",
        validators: [
            (value, _this, ctx) => {
                let errors = [];
                if (!value) {
                    errors.push({ message: _this.name + "不能为空参" });
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
                        errors.push({ message: authErrors.UNSUPPORTED_RESPONSE_TYPE });
                    }
                }
                return errors;
            }
        ]
    }, {
        name: "client_id",
        validators: [
            // 该校验函数会将查询结果挂在request对象中
            async (value, _this, ctx) => {
                let errors = [];
                if (!value) {
                    errors.push({ message: _this.name + "不能为空" });
                }
                else {
                    const client = await clientService.getClientById(+value);
                    ctx.request.client = client;
                    if (!client) {
                        errors.push({ message: "未知的" + _this.name });
                    }
                }
                return errors;
            }
        ]
    }, {
        name: "redirect_uri",
        validators: [
            (value, _this, ctx) => {
                let errors = [];
                let { redirect_uri } = ctx.request.query;
                if (!redirect_uri) {
                    errors.push({ message: _this.name + "不能为空参" });
                }
                else {
                    redirect_uri = decodeURIComponent(redirect_uri);
                    ctx.request.query.redirect_uri = redirect_uri;
                }
                const client = ctx.request.client;
                if (client) {
                    if (!client.redirect_uris.includes(redirect_uri)) {
                        errors.push({ message: "不匹配的" + _this.name });
                    }
                }
                return errors;
            }
        ]
    }]
}]

const patternsForApprove = [{
    position: "body",
    rules: [{
        name: "uuid",
        validators: [
            (value, _this, ctx) => {
                let errors = [];
                if (!value) {
                    errors.push({ message: _this.name + "不能为空" });
                }
                else {
                    if (!checkRequest(value)) {
                        errors.push({ message: _this.name + "不存在" });
                    }
                }
                return errors;
            }
        ]
    }, {
        name: "action",
        validators: [
            (value, _this, ctx) => {
                let errors = [];
                if (!value) {
                    errors.push({ message: _this.name + "不能为空" });
                }
                else {
                    if (value !== AGREE && value !== REJECT) {
                        errors.push({ message: _this.name + "输入错误" })
                    }
                }
                return errors;
            }
        ]
    }]
}];

module.exports = {
    patternsForAuthorize, patternsForApprove
}
