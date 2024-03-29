const Koa = require('koa');
const bodyParser = require("koa-bodyparser");
const views = require('koa-views');
const _static = require("koa-static");
const path = require("path");

const app = new Koa();

const clientRouter = require("./controller/clientController");
const openRouter = require("./controller/openController");
const testRouter = require("./controller/testController");

const config = require("./config/appConfig");
const errorHandler = require("./middleware/globalErrorHandler");

app.use(bodyParser());
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
