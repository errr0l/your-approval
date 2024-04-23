const path = require("path");
const { parse } = require("../../../common/src/config/ini");
const fs = require("fs");

const rootDir = path.resolve(process.cwd());

// 应用的元信息；
// appMeta.configName对应配置文件的名称，如果修改文件名称时，app-meta.json中的configName也需要一同修改；
const appMeta = require(rootDir + path.sep + "app-meta.json");
const configFilePath = rootDir + path.sep + appMeta.configName;

if (!fs.existsSync(configFilePath)) {
    throw new Error(appMeta.configName + "配置文件不存在");
}

const appConfig = parse(fs.readFileSync(configFilePath, { encoding: 'utf-8' }));

appConfig.rootDir = rootDir;

module.exports = appConfig;
