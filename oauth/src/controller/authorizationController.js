// 认证相关
const Router = require('koa-router');
const compose = require("koa-compose");

const { ACT_1, ACT_2, ID_TOKEN, REDIS_OK, AUTHORIZATION, INTERNAL_SERVER_ERROR, REFRESH_TOKEN, MESSAGE_1 } = require("../../../common/src/constants/general");
const { joinUrl } = require("../../../common/src/util/urlUtil");
const tokenService = require("../service/tokenService");
const tokenUtil = require("../util/tokenGenerator");
const { errors: oauthErrors, grantTypes, responseTypes } = require("../constants/oauth");
const patterns = require("./pattern/patternsForAuthorizationController");
const paramChecker = require("../../../common/src/middleware/paramChecker");
const { OauthException, CustomException, ClientException } = require("../../../common/src/exception");
const clientService = require("../service/clientService");
const { decodeClientCredentials, getScopesFromBody, generateUuid, encodeWithMd5 } = require("../../../common/src/util/common");
const { codeStore } = require("../store");
const config = require("../config/appConfig");
const userService = require("../service/userService");
const { client: redisClient } = require("../config/redisHelper");
const { buildUserinfo } = require("../../../common/src/util/oidcUtil");
const emailService = require("../service/emailService");
const { handler: tokenHandler, tokenChecker } = require("../middleware/tokenChecker");
const { pool, executeWithTransaction } = require("../config/DBHelper");
const urlPrefix = config.server.url_prefix || "";
const userLoader = require("../../../common/src/middleware/userLoader");
const { saveToDisk, readFromDisk } = require("../util/localUserStoreUtil");

const router = new Router({
    prefix: "/oauth2"
});

router.get("/", userLoader({ client: redisClient, readFromDisk }), async (ctx) => {
    const { from } = ctx.request.query;
    let title = "WELCOME";
    let message = ":D you're here.";
    if (from === "logout") {
        title = "BYE!";
        message = "hope to see you again.";
    }
    await ctx.render("index", { title, message, urlPrefix, user: ctx.request.user });
});

router.get("/register", async (ctx) => {
    await ctx.render("register", { urlPrefix });
});

// 撤销授权；同样需要客户端id和秘钥
router.post('/revoke', compose([tokenChecker(), paramChecker(patterns.revoke)]), async ctx => {
    const req = ctx.request;
    const { credential } = req.body;
    const { secret: clientSecret, id: clientId } = decodeClientCredentials(credential);
    console.log("credential：id->%s, secret->%s", clientId, clientSecret);
    let client;
    if (clientId) {
        client = await clientService.getClientById(clientId);
    }

    if (!client) {
        throw new ClientException({ code: oauthErrors.UNKNOWN_CLIENT });
    }

    if (clientSecret !== client.secret) {
        throw new ClientException({ code: oauthErrors.INVALID_CLIENT });
    }
    const token = req.token;
    const tokenId = token.id;
    const results = await Promise.all([tokenService.delToken(token), redisClient.del(tokenId)]);
    console.log("执行结果：");
    console.log(results);
    ctx.body = { error: '', message: MESSAGE_1 };
});

// 验证token
router.post('/verify', paramChecker(patterns.verify), async (ctx) => {
    const token = ctx.request.body.token;
    const { decoded } = await tokenHandler(token, { saving: false, serializing: false });
    ctx.body = { error: '', payload: decoded };
});

// 刷新token；
// 刷新后。之前的访问令牌无法再次使用；
router.post('/refresh',
    tokenChecker({
        handlerOpts: {
            target: REFRESH_TOKEN, saving: false, serializing: false
        }
    }),
    async (ctx) => {
    const token = ctx.request.token; // 刷新令牌
    const { id, client_id: clientId, user_id: userId } = token;
    const tokenDecoded = ctx.request.tokenDecoded; // 刷新令牌解析结果
    // 重新颁发token，但不包括id_token；
    // id_token需要每次重新认证
    const tokenPayload = { clientId, userId, tokenId: id };
    const accessToken = tokenUtil.generateToken(tokenPayload);
    // 临近过期时，重新生成
    let refreshToken;
    console.log("token -> ", token);
    if ((tokenDecoded.exp - Date.now() / 1000) < 60 * 60 * 24) {
        refreshToken = tokenUtil.generateRefreshToken(tokenPayload);
    }
    else {
        refreshToken = token.refresh_token;
    }

    const tokenEntity = {
        id, accessToken, refreshToken
    };
    const results = await Promise.all([tokenService.update(tokenEntity), redisClient.del(id)]);
    console.log("执行结果：");
    console.log(results);
    if (!results.length) {
        throw new CustomException({ code: INTERNAL_SERVER_ERROR, message: '刷新失败' });
    }
    ctx.body = {
        error: '',
        payload: {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: "bearer"
        }
    };
});

router.get("/logout", async (ctx) => {
    const user = ctx.session.user;
    if (user.id) {
        console.log("登出用户：%s", ctx.session.user.id);
        ctx.session = {};
    }
    const sessionToken = ctx.cookies.get("session_token");
    if (sessionToken) {
        console.log("删除sessionToken：" + sessionToken);
        const result = await redisClient.del(sessionToken);
        ctx.cookies.set('session_token', "", {
            maxAge: 0
        });
    }
    let path = urlPrefix + "/oauth2?from=logout";
    await ctx.redirect(path);
});

router.post("/register", paramChecker(patterns.register), async (ctx) => {
    const formData = ctx.request.body;
    // 核对验证码；不使用接口，直接操作redis也是可以的；
    await emailService.verify(formData.code, formData.email);
    if (await userService.register(formData)) {
        ctx.body = { error: '', message: '注册成功' };
    }
    else {
        throw new CustomException();
    }
});

// 为防止使用过期缓存，在修改用户信息时，或许应该把缓存修改？先不管
router.post("/authenticate", paramChecker(patterns.authenticate), async (ctx) => {
    let { username, password, query } = ctx.request.body;
    const user = await userService.login(username, password);
    ctx.session.user = user;
    const sessionToken = generateUuid();
    const date = new Date();
    // 获取当前毫秒
    const ms1 = date.getTime();
    date.setMonth(date.getMonth() + +config.cookie.session_token_ttl);
    const ms2 = date.getTime();
    const milliseconds = ms2 - ms1;
    ctx.cookies.set('session_token', sessionToken, {
        maxAge: milliseconds
    });
    query = JSON.parse(query);
    query.redirect_uri = encodeURIComponent(query.redirect_uri);
    const resp = await redisClient.set(sessionToken, JSON.stringify(user), "EX", 60 * 60 * 24 * 7);
    if (REDIS_OK !== resp) {
        throw new CustomException();
    }
    saveToDisk(sessionToken, user, ms2);
    // 登陆后，跳转回授权页面（携带参数）
    ctx.redirect(joinUrl(urlPrefix + "/oauth2/authorize", query));
});

router.get("/authorize", compose([userLoader({ client: redisClient, readFromDisk }), paramChecker(patterns.authorize, {
    errorHandler: (errors, ctx) => {
        throw new OauthException({
            code: oauthErrors.INVALID_REQUEST, message: errors.join(";"),
            redirectUrl: decodeURIComponent(ctx.request.query.redirect_uri)
        });
    },
    errorCode: oauthErrors.INVALID_REQUEST
})]), async (ctx, next) => {
    const req = ctx.request;
    const { client_id: clientId, redirect_uri: redirectUri } = req.query;
    let user = ctx.request.user;
    let tempData;
    // 用户没登录时，不需要记录以下数据
    if (user) {
        const clientKey = `client_${clientId}`;
        let client;
        if (!(client = ctx.session[clientKey])) {
            client = await clientService.getClientById(clientId);
            ctx.session[clientKey] = client;
        }
        const _redirectUri = decodeURIComponent(redirectUri);
        if (!client) {
            throw new OauthException({
                code: oauthErrors.UNKNOWN_CLIENT,
                redirectUrl: _redirectUri
            });
        }
        // 校验重定向地址
        if (!client.redirect_uris.includes(_redirectUri)) {
            throw new ClientException({ code: oauthErrors.INVALID_REDIRECT_URI });
        }
        // 保存一些必要的数据给下个请求使用
        ctx.session.preReqData = {
            query: req.query,
            redirectUri: _redirectUri,
            client,
            _containedOpenid: req._containedOpenid
        };
        const scopes = config.oauth.scopes;
        let askedScopes = req._scopes; // 在中间件处理的
        const clientScopes = client.scope.split(" ");
        // 如果申请了客户端不存在的权限范围时，返回错误；
        // 客户端的scope必须是授权服务器scope的子集，
        // 这一点需要再客户端入库时（包括手动录入）做校验，否则判断会出现错误；
        const actual = [];
        for (const askedScope of askedScopes) {
            if (!clientScopes.includes(askedScope)) {
                throw new OauthException({
                    code: oauthErrors.INVALID_SCOPE,
                    redirectUrl: decodeURIComponent(req.redirectUri)
                });
            }
            // 处理数据库跟服务器配置不同步的情况
            if (scopes[askedScope]) {
                actual.push(askedScope);
            }
        }
        tempData = {
            oauthClient: client, scopes, askedScopes: actual, user
        };
    }
    else {
        tempData = { user: null, query: JSON.stringify(req.query) };
    }
    tempData['urlPrefix'] = urlPrefix;
    await ctx.render('approve', tempData);
});

// 用户可在授权页面上进行操作；
router.post("/approve", async (ctx, next) => {
    const { action, ...scopes } = ctx.request.body;
    const _scopes = getScopesFromBody(scopes); // 即真正授权范围
    // const preReq = requestStore.get(uuid);
    // 获取上一个请求
    const preReqData = ctx.session.preReqData;
    if (!preReqData) {
        throw new CustomException({ code: oauthErrors.UNKNOWN_REQUEST });
    }
    let { response_type: responseType, state } = preReqData.query;
    const redirectUri = preReqData.redirectUri;
    const queries = {};
    // 同意授权
    if (action === ACT_1) {
        // 授权码模式
        if (responseType === responseTypes.CODE) {
            const code = generateUuid();
            queries['code'] = code;
            if (state) {
                queries['state'] = state;
            }
            const client = preReqData.client;
            const req = ctx.request;
            req.client = client;
            req.scopes = _scopes;
            req._containedOpenid = preReqData._containedOpenid;
            req.user = ctx.session.user;
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
router.post("/token", paramChecker(patterns.token, {
    errorHandler: (errors, ctx) => {
        throw new ClientException({ code: oauthErrors.INVALID_REQUEST, message: errors.join(";") });
    },
    errorCode: oauthErrors.INVALID_REQUEST
}), async (ctx, next) => {
    const req = ctx.request;
    let { grant_type: grantType, code, client_id: clientId, redirect_uri: redirectUri } = req.body
    clientId = +clientId;
    const preReq = codeStore.get(code);
    // 校验code
    if (!preReq) {
        throw new ClientException({ code: oauthErrors.INVALID_CODE });
    }
    const client = preReq.client;
    const { secret, id } = decodeClientCredentials(req.headers[AUTHORIZATION]);
    // 校验客户端
    if ((+id !== clientId) || (client.id !== clientId) || (client.secret !== secret)) {
        throw new ClientException({ code: oauthErrors.INVALID_CLIENT });
    }
    // 校验重定向地址
    if (!client.redirect_uris.includes(redirectUri)) {
        throw new ClientException({ code: oauthErrors.INVALID_REDIRECT_URI });
    }

    const user = preReq.user;

    let respData;
    const scope = preReq.scopes.join(" "); // 将数组拆分为字符串
    const tokenId = generateUuid();
    const tokenPayload = { clientId, userId: user.id, tokenId: tokenId };
    const accessToken = tokenUtil.generateToken(tokenPayload);
    const refreshToken = tokenUtil.generateRefreshToken(tokenPayload);
    if (grantType === grantTypes.AUTHORIZATION_TYPE) {
        respData = {
            error: '',
            payload: {
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: "bearer"
            }
        };
        // 在校验时添加的属性
        if (preReq._containedOpenid) {
            const idTokenPayload = {
                client_id: clientId,
                openid: encodeWithMd5(clientId + "@" + user.id),
                userinfo: buildUserinfo(preReq.scopes, user)
            };
            respData.payload[ID_TOKEN] = tokenUtil.generateIdToken(idTokenPayload);
        }
    }

    // 保证每个用户仅有一个token记录
    const tokens = await tokenService.getTokensByUserId(user.id);
    const pms = [];
    const conn = await pool.getConnection();
    if (tokens.length) {
        const _token = tokens[0];
        pms.push(conn.execute(tokenService.sqlMap.delToken, [_token.id]));
        console.log("删除数据库中的token：", _token);
        const redisResp = await redisClient.del(_token.id);
        console.log("redis删除结果：", redisResp);
    }
    const tokenEntity = {
        id: tokenId,
        accessToken,
        refreshToken,
        clientId, userId: user.id, scope: scope
    };
    pms.push(conn.execute(tokenService.sqlMap.save, [tokenEntity.id, tokenEntity.accessToken, tokenEntity.refreshToken, tokenEntity.clientId, tokenEntity.userId, tokenEntity.scope]));
    const results = await executeWithTransaction(conn, pms);
    console.log("执行结果：");
    console.log(results);
    if (!results.length) {
        throw new CustomException({ code: INTERNAL_SERVER_ERROR });
    }
    return ctx.body = respData;
});

module.exports = router;
