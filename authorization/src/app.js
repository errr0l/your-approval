const Koa = require('koa');
const bodyParser = require("koa-bodyparser");
const views = require('koa-views');
const _static = require("koa-static");
const session = require('koa-session');
// const cookies = require("koa-cookies");
const path = require("path");

const app = new Koa();

const clientRouter = require("./controller/clientController");
const openRouter = require("./controller/openController");
const testRouter = require("./controller/testController");

const config = require("./config/appConfig");
const errorHandler = require("./middleware/globalErrorHandler");

app.keys = config.server.keys;
app.use(bodyParser());
app.use(session({
    maxAge: 1000 * 60 * 30,
    key: 'sessionid',
    renew: true,
    signed: false
}, app));
// app.use(cookies());
app.use(views(path.join(__dirname, "./views"), {
    extension: 'ejs'
}));
app.use(_static(path.join(__dirname, '../static')));

app.use(errorHandler);
app.use(clientRouter.routes());
app.use(openRouter.routes());
app.use(testRouter.routes());

// "192.168.3.18",
const server = app.listen(config.server.port, function () {
    let host = server.address().address;
    const port = server.address().port;
    if (host === "::") {
        host = "localhost";
    }
    console.log('The Server is listening at http://%s:%s', host, port);
});
