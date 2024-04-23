// your-approval管理模块
const Koa = require('koa');
const bodyParser = require("koa-bodyparser");

const app = new Koa();

const clientRouter = require("./controller/clientController");

const errorHandler = require("../../common/src/middleware/globalErrorHandler");
const { getIp } = require("../../common/src/util/common");

const config = require("./config/appConfig");

app.use(bodyParser());
app.use(errorHandler);
app.use(clientRouter.routes());

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
