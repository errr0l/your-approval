const Router = require('koa-router');

const paramChecker = require("../../../common/src/middleware/paramChecker");
const patterns = require("./pattern/patternsForAssistController");
const emailService = require("../service/emailService");

// 辅助模块
const router = new Router({
    prefix: "/assist"
});

// 发送邮件
router.post("/captcha/sendCode", paramChecker(patterns.sendCode), async (ctx) => {
    const { email } = ctx.request.body;
    await emailService.setEmailCode(email);
    ctx.body = { error: '', message: 'ok' };
});

// router.post("/captcha/verify", paramChecker(patterns.verify), async (ctx) => {
//     const { code, email } = ctx.request.body;
//     await emailService.verify(code, email);
//     ctx.body = { error: '' };
// });

module.exports = router;