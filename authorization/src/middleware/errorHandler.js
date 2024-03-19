const { getBestMIMEType, MIME_HTML } = require("../util/respUtil");
const { CODE_50001 } = require("../constants/responseCode");
const { INTERNAL_SERVER_ERROR } = require("../constants/general");

async function errorHandler(ctx, next) {
    try {
        await next();
    } catch (error) {
        const req = ctx.request;
        const accept = req.headers['accept'];
        // 优先返回json
        const bestMIMEType = getBestMIMEType(accept);
        // 目前只支持两种：要么html，要么json
        // 在oauth中，error对应的是code，message对应error_description（但oauth的error不是数字）
        const respData = { code: error.code || CODE_50001, message: error.message || INTERNAL_SERVER_ERROR };
        if (bestMIMEType === MIME_HTML) {
            await ctx.render('error', respData);
        }
        else {
            ctx.body = respData;
        }
        ctx.status = error.statusCode || 500;
    }
}

module.exports = errorHandler;