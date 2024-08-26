const Koa = require('koa');
const bodyParser = require("koa-bodyparser");
const views = require('koa-views');
const _static = require("koa-static");
const session = require('koa-session');
const path = require("path");

// 授权和资源服务器不区分；
// 理论上分开好一点，但鉴于本系统没有太多的功能，合并在一起也可以；
// 本系统只实现了授权码模式，且参数传递没有做适配；
const app = new Koa();

const authorizationRouter = require("./controller/authorizationController");
const resourceRouter = require("./controller/resourceController");
// const testRouter = require("./controller/testController");
const assistRouter = require("./controller/assistController");

const config = require("./config/appConfig");
const errorHandler = require("../../common/src/middleware/globalErrorHandler");
const { getIp } = require("../../common/src/util/common");

app.keys = config.server.keys;
app.use(bodyParser());
app.use(session({
    maxAge: 1000 * 60 * 30,
    key: 'sessionid',
    renew: true,
    signed: false
}, app));
app.use(views(path.join(__dirname, "./views"), {
    extension: 'ejs'
}));
app.use(_static(path.join(__dirname, '../static')));

app.use(errorHandler({
    urlPrefix: config.server.url_prefix || ""
}));
app.use(authorizationRouter.routes());
app.use(resourceRouter.routes());
// app.use(testRouter.routes());
app.use(assistRouter.routes());

// 如果不在listen方法中指定绑定的地址的话，通过ip或localhost都可以访问；
// app.listen(port, host, function);
const server = app.listen(config.server.port, function () {
    let host = server.address().address;
    const port = server.address().port;
    if (host === "::") {
        host = "localhost";
    }
    const ip = getIp();
    console.log("App running at：");
    console.log("- http://%s:%s", host, port);
    console.log('- http://%s:%s', ip, port);
});

process.on('uncaughtException', (error) => {
    console.error('未捕获的异常：', error);
});


process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的拒绝：', promise, '原因：', reason);
});