// 资源相关
const Router = require('koa-router');
const compose = require("koa-compose");

const tokenChecker = require("../middleware/tokenChecker");
const scopeChecker = require("../middleware/scopeChecker");
const { buildUserinfo } = require("../../../common/src/util/oidcUtil");
const userService = require("../service/userService");

const router = new Router({
    prefix: "/oauth2"
});

router.get("/userinfo", compose([tokenChecker(), scopeChecker('openid')]), async (ctx) => {
    const userId = ctx.request.tokenDecoded.userId;
    const user = await userService.getUserById(userId);
    ctx.body = {
        error: '',
        payload: buildUserinfo(ctx.request.scopes, user)
    };
});

module.exports = router;