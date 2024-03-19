// 以模块区分
const { responseTypes, errors: authErrors } = require("../../constants/oauth");

// 当然，不以这种方式来校验也是可以的
const patternsForAuthorize = [
    {
        position: "query",
        rules: [
            {
                name: "response_type",
                validators: [
                    (value, ctx) => {
                        let errors = [];
                        if (!value) {
                            errors.push({ message: "参数缺失：" + ctx.name });
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
            }
        ],
    },
    // {
    //     name: "client_id",
    //     rules: [
    //         (value) => {
    //
    //         }
    //     ]
    // }
]

module.exports = {
    patternsForAuthorize
}
