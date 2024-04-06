const { CODE_500, CODE_400, CODE_200 } = require("../constants/general");

class CustomException extends Error {
    code;
    statusCode;
    constructor({ code, message, statusCode } = {}) {
        super(message || "");
        this.code = code;
        this.statusCode = statusCode || CODE_500;
    }
}

class ClientException extends CustomException {
    constructor({ code, message } = {}) {
        super({ code: code, message: message || "" });
        this.statusCode = CODE_400;
    }
}

// 授权过程发生的异常；
// 捕获到该异常后，将会重定向至redirectUrl
class OauthException extends CustomException {
    redirectUrl;
    joined;

    constructor({ code, message, redirectUrl, joined = false }) {
        super({ code, message });
        this.statusCode = CODE_200;
        this.redirectUrl = redirectUrl;
        this.joined = joined;
    }
}

module.exports = {
    CustomException, ClientException, OauthException
}