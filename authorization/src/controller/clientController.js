const Router = require('koa-router');

const router = new Router({ prefix: "/oauth2/client" });

router.get("/", (ctx, next) => {
    ctx.body = "hello, this is clientController."
});

module.exports = router;