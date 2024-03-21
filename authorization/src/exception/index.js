const { errors } = require("../constants/oauth");

class CustomException extends Error {
    code;
    statusCode;
    constructor({ code, message, statusCode } = {}) {
        super(message || "");
        this.code = code || errors.INTERNAL_SERVER_ERROR;
        this.statusCode = statusCode || 500;
    }
}

class ClientException extends CustomException {
    constructor({ code, message }) {
        super({ code: code || errors.INVALID_REQUEST, message });
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