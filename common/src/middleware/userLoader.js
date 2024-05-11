// 从session或redis中读取用户信息，并设置到ctx.request对象中
// ctx.request.user
function userLoader(params) {
    const client = params.client;
    return async function (ctx, next) {
        // 在session中获取user；
        // 如果已经过期时，从redis中获取，并赋予session（相当于重新登陆）；
        let user = ctx.session.user;
        if (!user) {
            const sessionToken = ctx.cookies.get("session_token");
            if (sessionToken) {
                const userStr = await client.get(sessionToken);
                if (userStr) {
                    user = JSON.parse(userStr);
                    ctx.session.user = user;
                }
            }
        }
        ctx.request.user = ctx.session.user;
        await next();
    }
}

module.exports = userLoader;