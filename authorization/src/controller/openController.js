const Router = require('koa-router');
const { v4: uuidV4 } = require("uuid");

const { pool } = require("../config/DBHelper");
const { AGREE, REJECT, CODE } = require("../constants/general");
const { saveRequest, getRequest } = require("../util/tempStoreForRequest");
const { joinUrl } = require("../util/urlUtil");

const router = new Router({
    prefix: "/oauth2"
});

router.post("/", async (ctx, next) => {
    ctx.body = "ok";
});

// 授权页面；
// oauth客户端请求该路由后，将会跳转至授权页面
router.get("/authorize", async (ctx, next) => {
    const req = ctx.request;
    const { responseType, clientId, redirectUri, state } = req.query;
    const [rows] = await pool.query("select * from `client` where `id` = ?", [clientId]);
    if (!rows.length) {
        return await ctx.render('error', {
            code: 40001,
            message: '客户端不存在，id=' + clientId
        });
    }
    const uuid = uuidV4();
    const client = rows[0];
    req.client = client;
    saveRequest(uuid, req);
    await ctx.render('approval', {
        client: client,
        uuid: uuid
    });
});

// 授权；
// 用户可在授权页面上进行操作：1）同意；2）拒绝
router.post("/approve", async (ctx, next) => {
    const { action, uuid, scope } = ctx.request.body;
    const preReq = getRequest(uuid);

    if (!preReq) {
        return await ctx.render('error', { code: 40001, message: '没有匹配的授权请求，请尝试重新授权' })
    }
    let { responseType, clientId, redirectUri, state } = preReq.query;
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
            queries['error'] = "unsupported_response_type";
        }
    }
    // 不同意
    else if (action === REJECT) {
        queries['error'] = 'access_denied';
    }
    else {
        return await ctx.render("error", {
            code: 400001,
            message: "参数错误：action=" + action
        });
    }
    const redirectUrl = joinUrl(redirectUri, queries);
    await ctx.redirect(redirectUrl);
});

// 兑换令牌；
// 包括：access_token，refresh_token，以及code（可以看作是对话访问令牌的一次性令牌）；
router.post("/token", (ctx, next) => {
    ctx.body = "兑换令牌";
});

module.exports = router;
