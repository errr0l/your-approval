const { getBestMIMEType, MIME_HTML } = require("../util/respUtil");
const { INTERNAL_SERVER_ERROR, CODE_500 } = require("../constants/general");
const { joinUrl } = require("../util/urlUtil");
const { OauthException } = require("../exception");

function globalErrorHandler(opts) {
    const urlPrefix = opts.urlPrefix;
    return async function (ctx, next) {
        try {
            await next();
        } catch (error) {
            console.error(error);
            const req = ctx.request;
            const accept = req.headers['accept'];
            const bestMIMEType = getBestMIMEType(accept);
            const respData = { error: error.code || INTERNAL_SERVER_ERROR };
            if (error instanceof OauthException && error.redirectUrl) {
                // joined：是否已经完成url拼接
                let url = error.redirectUrl;
                // 尽量按照规范...
                respData['error_description'] = error.message || "";
                if (!error.joined) {
                    url = joinUrl(url, respData);
                }
                return ctx.redirect(url);
            }
            respData['message'] = error.message || "";
            // 目前只支持两种：要么html，要么json
            if (bestMIMEType === MIME_HTML) {
                respData['urlPrefix'] = urlPrefix;
                await ctx.render('error', respData);
            }
            else {
                ctx.body = respData;
            }
            ctx.status = error.statusCode || CODE_500;
        }
    }
}

module.exports = globalErrorHandler;