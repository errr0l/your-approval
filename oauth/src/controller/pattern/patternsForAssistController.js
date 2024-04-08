const { emailRule } = require("./patternsForAuthorizationController");

const sendCode = [{
    position: "body",
    rules: [{
        name: "email",
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
    }]
}];

const verify = [{
    position: "body",
    rules: [{
        name: "code",
        required: true,
    }, {
        name: "email",
        required: true,
    }]
}];

module.exports = {
    sendCode, verify
};

