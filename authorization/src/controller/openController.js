const Router = require('koa-router');
const { v4: uuidV4 } = require("uuid");

const {
    AGREE, REJECT, CODE, INTERNAL_SERVER_ERROR
} = require("../constants/general");
const { saveRequest, getRequest } = require("../util/tempStoreForRequest");
const { joinUrl } = require("../util/urlUtil");
const { CODE_0, CODE_40001, CODE_0_MESSAGE } = require("../constants/responseCode");
const clientService = require("../service/clientService");
const tokenService = require("../service/tokenService");
const tokenUtil = require("../util/tokenUtil");
const { errors: oauthErrors, grantTypes } = require("../constants/oauth");

const router = new Router({
    prefix: "/oauth2"
});

router.get("/", async (ctx, next) => {
    ctx.body = "easyums oauth";
    throw new Error('123');
});

// 授权页面；
// oauth客户端请求该路由后，将会跳转至授权页面
// 可使用中间件校验参数：redirect_uri等等
// decodeURIComponent(redirectUri)
// if (!client) {
//     return ctx.redirect(joinUrl(redirectUri, {
//         error: oauthErrors.UNKNOWN_CLIENT
//     }));
// }
router.get("/authorize", async (ctx, next) => {
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
router.post("/approve", async (ctx, next) => {
    const { action, uuid, scope } = ctx.request.body;
    const preReq = getRequest(uuid);
    if (!preReq) {
        return ctx.render("error", {
            code: CODE_40001,
            message: oauthErrors.UNKNOWN_REQUEST
        });
    }
    let { response_type: responseType, redirect_uri: redirectUri, state } = preReq.query;
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
            queries['error'] = oauthErrors.UNSUPPORTED_RESPONSE_TYPE;
        }
    }
    // 不同意这里算是操作成功的流程；怎么判断是应该渲染还是重定向？还是说，一律把错误返回？
    else if (action === REJECT) {
        queries['error'] = oauthErrors.ACCESS_DENIED;
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
        return ctx.body = { code: CODE_40001, message: oauthErrors.INVALID_GRANT };
    }
    // const authorization = req.headers['Authorization'];
    // const { id, secret } = decodeClientCredentials(authorization);

    // 校验客户端
    // if (!id || !secret || client.id !== id || client.secret !== secret) {
    // 是否需要传输秘钥？
    if (client.id !== clientId) {
        return ctx.body = { code: CODE_40001, message: oauthErrors.INVALID_GRANT };
    }

    let respData;
    if (grantType === grantTypes.AUTHORIZATION_TYPE) {
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
            respData = { error: INTERNAL_SERVER_ERROR };
        }
    }
    else {
        respData = { error: oauthErrors.UNSUPPORTED_GRANT_TYPE };
    }
    return ctx.body = respData;
});

module.exports = router;
