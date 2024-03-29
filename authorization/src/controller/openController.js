const Router = require('koa-router');
const { v4: uuidV4 } = require("uuid");

const { ACT_1, ACT_2, ID_TOKEN } = require("../constants/general");
const { joinUrl } = require("../util/urlUtil");
const tokenService = require("../service/tokenService");
const tokenUtil = require("../util/tokenUtil");
const { errors: oauthErrors, grantTypes, responseTypes } = require("../constants/oauth");
const { patternsForAuthorize, patternsForApprove, patternsForToken } = require("./pattern/openPattern");
const paramChecker = require("../middleware/paramChecker");
const { OauthException, CustomException, ClientException } = require("../exception");
const clientService = require("../service/clientService");
const { decodeClientCredentials } = require("../util/common");
const { codeStore, requestStore } = require("../store");
const config = require("../config/appConfig");

const router = new Router({
    prefix: "/oauth2"
});

router.get("/", async (ctx, next) => {
    ctx.body = "easyums oauth";
});

router.post("/", async (ctx) => {
   const { username, password } = ctx.request.body;
});

router.get("/authorize", paramChecker(patternsForAuthorize, (errors, ctx) => {
    const redirectUri = decodeURIComponent(ctx.request.query.redirect_uri);
    ctx.request.query.redirect_uri = redirectUri;
    ctx.request.redirectUriProcessed = true;
    throw new OauthException({
        code: oauthErrors.INVALID_REQUEST, message: errors.join(";"),
        redirectUrl: redirectUri
    });
}), async (ctx, next) => {
    const req = ctx.request;
    const { client_id: clientId, redirect_uri: redirectUri, scope } = req.query;
    const client = await clientService.getClientById(clientId);
    if (!req.redirectUriProcessed) {
        req.query.redirect_uri = decodeURIComponent(redirectUri);
    }
    if (!client) {
        throw new OauthException({
            code: oauthErrors.UNKNOWN_CLIENT,
            redirectUrl: req.redirectUrl
        });
    }
    const uuid = uuidV4();
    req.client = client;
    requestStore.save(uuid, req);
    const scopes = config.oauth.scopes;
    let askedScopes = req._scopes;
    if (!askedScopes) {
        askedScopes = scope.trim().split(" ");
    }
    await ctx.render('approval', {
        client, uuid, scopes, askedScopes
    });
});

// 授权；
// 用户可在授权页面上进行操作；
router.post("/approve", paramChecker(patternsForApprove, null), async (ctx, next) => {
    const { action, uuid, scope } = ctx.request.body;
    const preReq = requestStore.get(uuid);
    if (!preReq) {
        throw new CustomException({ code: oauthErrors.UNKNOWN_REQUEST });
    }
    let { response_type: responseType, redirect_uri: redirectUri, state } = preReq.query;
    const queries = {};
    // 同意授权
    if (action === ACT_1) {
        // 授权码模式
        if (responseType === responseTypes.CODE) {
            const code = uuidV4().replaceAll("-", "");
            queries['code'] = code;
            if (state) {
                queries['state'] = state;
            }
            const client = preReq.client;
            const req = ctx.request;
            req.client = client;
            req.scope = scope;
            req._containedOpenid = preReq._containedOpenid;
            codeStore.save(code, req);
        }
    }
    // 不同意这里算是操作成功的流程；怎么判断是应该渲染还是重定向？还是说，一律把错误返回？
    else if (action === ACT_2) {
        queries['error'] = oauthErrors.ACCESS_DENIED;
    }
    const redirectUrl = joinUrl(redirectUri, queries);
    await ctx.redirect(redirectUrl);
});

// 兑换token；
router.post("/token", paramChecker(patternsForToken, (errors, ctx) => {
    throw new ClientException({ message: errors.join(";") });
}), async (ctx, next) => {
    const req = ctx.request;
    const { grant_type: grantType, code, client_id: clientId, redirect_uri: redirectUri } = req.body;
    const preReq = codeStore.get(code);
    // 校验code
    if (!preReq) {
        throw new ClientException({ code: oauthErrors.INVALID_CODE });
    }
    const client = preReq.client;
    const { secret, id } = decodeClientCredentials(req.headers['authorization']);
    // 校验客户端
    if ((+id !== clientId) || (client.id !== clientId) || (client.secret !== secret)) {
        throw new ClientException({ code: oauthErrors.INVALID_CLIENT });
    }
    // 校验重定向地址
    if (!client.redirect_uris.includes(redirectUri)) {
        throw new ClientException({ code: oauthErrors.INVALID_REDIRECT_URI });
    }

    const user = preReq.user || { id: 1 };

    let respData;
    if (grantType === grantTypes.AUTHORIZATION_TYPE) {
        const payload = { clientId, userId: user.id, scope: preReq.scope };
        respData = {
            error: '',
            payload: {
                access_token: tokenUtil.generateToken(payload),
                refresh_token: tokenUtil.generateRefreshToken(payload),
                token_type: "bearer"
            }
        };

        // 在校验时添加的属性
        if (preReq._containedOpenid) {
            const payload = {
                sub: user.id,
                aud: clientId,
                user
            };
            respData.payload[ID_TOKEN] = tokenUtil.generateIdToken(payload);
        }
    }

    try {
        // 保证每个用户仅有一个token记录
        await tokenService.delTokensByUserId(user.id);
        const tokenEntity = {
            accessToken: respData.payload.access_token,
            refreshToken: respData.payload.refresh_token,
            clientId, userId: user.id, cope: preReq.scope
        };
        await tokenService.save(tokenEntity);
    } catch (error) {
        console.log(error);
        throw new CustomException();
    }
    return ctx.body = respData;
});

module.exports = router;
