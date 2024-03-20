const { CODE_50001, CODE_40001 } = require("../constants/responseCode");
const { INTERNAL_SERVER_ERROR } = require("../constants/general");

class CustomException extends Error {
    code;
    statusCode;
    constructor({ code, message, statusCode }) {
        super(message || INTERNAL_SERVER_ERROR);
        this.code = code || CODE_50001;
        this.statusCode = statusCode || 500;
    }
}

class ClientException extends CustomException {
    constructor({ code, message }) {
        super({ code: code || CODE_40001, message });
        this.statusCode = 400;
    }
}

class OauthException extends CustomException {
    redirectUrl;
    joined;

    constructor({ code, message, redirectUrl, joined = false }) {
        super({ code, message });
        this.statusCode = 200;
        this.redirectUrl = redirectUrl;
        this.joined = joined;
    }
}

module.exports = {
    CustomException, ClientException, OauthException
}