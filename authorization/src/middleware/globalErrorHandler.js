const { getBestMIMEType, MIME_HTML } = require("../util/respUtil");
const { CODE_50001 } = require("../constants/responseCode");
const { INTERNAL_SERVER_ERROR } = require("../constants/general");
const { joinUrl } = require("../util/urlUtil");
const { errors: oauthErrors } = require("../constants/oauth");
const { OauthException } = require("../exception");

async function globalErrorHandler(ctx, next) {
    try {
        await next();
    } catch (error) {
        const req = ctx.request;
        const accept = req.headers['accept'];
        const bestMIMEType = getBestMIMEType(accept);
        const respData = { error: error.code || CODE_50001, error_description: error.message || INTERNAL_SERVER_ERROR };
        // 若error为OauthException类型，则进行重定向；
        if (error instanceof OauthException) {
            // joined：是否已经完成url拼接
            let url = error.redirectUrl;
            if (!error.joined) {
                url = joinUrl(url, respData);
            }
            return ctx.redirect(url);
        }

        // 目前只支持两种：要么html，要么json
        if (bestMIMEType === MIME_HTML) {
            await ctx.render('error', respData);
        }
        else {
            ctx.body = respData;
        }
        ctx.status = error.statusCode || 500;
    }
}

module.exports = globalErrorHandler;