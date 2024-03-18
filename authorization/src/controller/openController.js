const Router = require('koa-router');
const { v4: uuidV4 } = require("uuid");

const {
    AGREE, REJECT, CODE, ACCESS_DENIED, UNSUPPORTED_RESPONSE_TYPE, AUTHORIZATION_TYPE, INVALID_GRANT,
    UNSUPPORTED_GRANT_TYPE, INTERNAL_SERVER_ERROR
} = require("../constants/general");
const { saveRequest, getRequest } = require("../util/tempStoreForRequest");
const { joinUrl } = require("../util/urlUtil");
const { CODE_0, CODE_40001, CODE_50001, CODE_0_MESSAGE } = require("../constants/responseCode");
const clientService = require("../service/clientService");
const tokenService = require("../service/tokenService");
const tokenUtil = require("../util/tokenUtil");

const router = new Router({
    prefix: "/oauth2"
});

router.post("/", async (ctx, next) => {
    ctx.body = "easyums oauth";
});

// 授权页面；
// oauth客户端请求该路由后，将会跳转至授权页面
router.get("/authorize", async (ctx, next) => {
    const req = ctx.request;
    const { client_id: clientId } = req.query;
    const client = await clientService.getClientById(+clientId);
    if (!client) {
        return await ctx.render('error', {
            code: CODE_40001,
            message: INVALID_GRANT
        });
    }
    const uuid = uuidV4();
    req.client = client;
    saveRequest(uuid, req);
    await ctx.render('approval', {
        client, uuid
    });
});

// 授权；
// 用户可在授权页面上进行操作；
router.post("/approve", async (ctx, next) => {
    const { action, uuid, scope } = ctx.request.body;
    const preReq = getRequest(uuid);

    if (!preReq) {
        return await ctx.render('error', { code: CODE_40001, message: INVALID_GRANT });
    }
    let { response_type: responseType, redirect_rri: redirectUri, state } = preReq.query;
    redirectUri = decodeURIComponent(redirectUri);
    const queries = {};
    // 同意授权
    if (action === AGREE) {
        if (responseType === CODE) {
            const code = uuidV4().replaceAll("-", "");
            queries['code'] = code;
            queries['state'] = state;
            const client = preReq.client;
            const req = ctx.request;
            req.scope = scope;
            req.client = client;
            saveRequest(code, req);
        }
        else {
            queries['error'] = UNSUPPORTED_RESPONSE_TYPE;
        }
    }
    // 不同意
    else if (action === REJECT) {
        queries['error'] = ACCESS_DENIED;
    }
    else {
        return await ctx.render("error", {
            code: CODE_40001,
            message: "参数错误：action=" + action
        });
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
    const client = preReq.client;
    if (!preReq) {
        return await ctx.body = { code: CODE_40001, message: INVALID_GRANT };
    }
    // const authorization = req.headers['Authorization'];
    // const { id, secret } = decodeClientCredentials(authorization);

    // 校验客户端
    // if (!id || !secret || client.id !== id || client.secret !== secret) {
    // 是否需要传输秘钥？
    if (client.id !== clientId) {
        return ctx.body = { code: CODE_40001, message: INVALID_GRANT };
    }

    let respData;
    if (grantType === AUTHORIZATION_TYPE) {
        const payload = { clientId }
        respData = {
            code: CODE_0,
            message: CODE_0_MESSAGE,
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
            respData = { code: CODE_50001, message: INTERNAL_SERVER_ERROR };
        }
    }
    else {
        respData = { code: CODE_40001, message: UNSUPPORTED_GRANT_TYPE };
    }
    return ctx.body = respData;
});

module.exports = router;
