const Router = require('koa-router');
const { v4: uuidV4 } = require("uuid");

const {
    AGREE, REJECT, CODE, INTERNAL_SERVER_ERROR
} = require("../constants/general");
const { saveRequest, getRequest } = require("../util/tempStoreForRequest");
const { joinUrl } = require("../util/urlUtil");
const { CODE_0 } = require("../constants/responseCode");
// const clientService = require("../service/clientService");
const tokenService = require("../service/tokenService");
const tokenUtil = require("../util/tokenUtil");
const { errors: oauthErrors, grantTypes } = require("../constants/oauth");
const { patternsForAuthorize, patternsForApprove } = require("./pattern/openPattern");
const paramChecker = require("../middleware/paramChecker");
const { OauthException, CustomException, ClientException } = require("../exception");

const router = new Router({
    prefix: "/oauth2"
});

router.get("/", async (ctx, next) => {
    ctx.body = "easyums oauth";
});

router.get("/authorize", paramChecker(patternsForAuthorize, (errors, ctx) => {
    if (errors.length && ctx.request.query.redirect_uri) {
        throw new OauthException({
            code: oauthErrors.INVALID_REQUEST, message: errors.map(item => item.message).join(";"),
            redirectUrl: ctx.request.query.redirect_uri
        });
    }
}), async (ctx, next) => {
    const req = ctx.request;
    const client = req.client;
    const uuid = uuidV4();
    saveRequest(uuid, req);
    await ctx.render('approval', {
        client, uuid
    });
});

// 授权；
// 用户可在授权页面上进行操作；
router.post("/approve", paramChecker(patternsForApprove, null), async (ctx, next) => {
    const { action, uuid, scope } = ctx.request.body;
    const preReq = getRequest(uuid);
    let { response_type: responseType, redirect_uri: redirectUri, state } = preReq.query;
    const queries = {};
    // 同意授权
    if (action === AGREE) {
        if (responseType === CODE) {
            const code = uuidV4().replaceAll("-", "");
            queries['code'] = code;
            if (state) {
                queries['state'] = state;
            }
            const client = preReq.client;
            const req = ctx.request;
            req.client = client;
            req.scope = scope;
            saveRequest(code, req);
        }
    }
    // 不同意这里算是操作成功的流程；怎么判断是应该渲染还是重定向？还是说，一律把错误返回？
    else if (action === REJECT) {
        queries['error'] = oauthErrors.ACCESS_DENIED;
    }
    const redirectUrl = joinUrl(redirectUri, queries);
    await ctx.redirect(redirectUrl);
});

// 兑换令牌；
// 包括：access_token，refresh_token，以及code（可以看作是对话访问令牌的一次性令牌）；
router.post("/token", async (ctx, next) => {
    const req = ctx.request;
    const { grant_type: grantType, code, redirect_uri: redirectUri, scope, client_id: clientId } = req.body;
    const preReq = getRequest(code);
    const client = preReq.state.client;
    if (!preReq) {
        throw new ClientException({ code: oauthErrors.INVALID_GRANT, message: "未知的code" });
    }
    // const authorization = req.headers['Authorization'];
    // const { id, secret } = decodeClientCredentials(authorization);

    // 校验客户端
    // if (!id || !secret || client.id !== id || client.secret !== secret) {
    // 是否需要传输秘钥？
    if (client.id !== clientId) {
        throw new ClientException({ code: oauthErrors.INVALID_GRANT, message: "未知的客户端" });
    }

    let respData;
    if (grantType === grantTypes.AUTHORIZATION_TYPE) {
        const payload = { clientId }
        respData = {
            error: CODE_0,
            payload: {
                access_token: tokenUtil.generateToken(payload),
                refresh_token: tokenUtil.generateRefreshToken(payload),
                token_type: "bearer", scope
            }
        };
        const tokenEntity = {
            accessToken: respData.payload.accessToken,
            refreshToken: respData.payload.refreshToken,
            clientId, userId: 1, // 待写
        };
        if (!(await tokenService.save(tokenEntity))) {
            throw new CustomException({ code: INTERNAL_SERVER_ERROR, message: "" });
        }
    }
    else {
        throw new CustomException({ code: oauthErrors.UNSUPPORTED_GRANT_TYPE, message: "", statusCode: 400 });
    }
    return ctx.body = respData;
});

module.exports = router;
