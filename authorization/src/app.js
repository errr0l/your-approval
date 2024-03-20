const Koa = require('koa');
const bodyParser = require("koa-bodyparser");
const views = require('koa-views');
const path = require("path");

const app = new Koa();

const clientRouter = require("./controller/clientController");
const openRouter = require("./controller/openController");
const config = require("./config/appConfig");
const errorHandler = require("./middleware/globalErrorHandler");

app.use(bodyParser());
app.use(views(path.join(__dirname, "./views"), {
    extension: 'ejs'
}));

app.use(errorHandler);
app.use(clientRouter.routes());
app.use(openRouter.routes());

// 读取配置文件

const server = app.listen(config.server.port, "localhost", function () {
    const host = server.address().address;
    const port = server.address().port;

    console.log('The Server is listening at http://%s:%s', host, port);
});
