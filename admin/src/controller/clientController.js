const Router = require("koa-router");

const router = new Router({
    prefix: "/client"
});

router.get("/pagination", async (ctx) => {
    ctx.body = {
        error: '',
        payload: null
    };
});

router.get("/:id", async (ctx) => {
    ctx.body = {
        error: '',
        payload: null
    };
});

router.post("/save", async (ctx) => {
    ctx.body = {
        error: '',
        payload: null
    };
});

router.post("/del", async (ctx) => {
    ctx.body = {
        error: '',
        payload: null
    };
});

router.post("/update", async (ctx) => {
    ctx.body = {
        error: '',
        payload: null
    };
});

module.exports = router;
