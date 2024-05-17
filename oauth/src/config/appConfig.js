const path = require("path");
const { parse } = require("../../../common/src/config/ini");
const fs = require("fs");

// 应用的元信息；
// appMeta.configName对应配置文件的名称，如果修改文件名称时，app-meta.json中的configName也需要一同修改；
const appMeta = require("../../app-meta.json");
const configFilePath = path.resolve(__dirname, `../../${appMeta.configName}`);

if (!fs.existsSync(configFilePath)) {
    throw new Error(appMeta.configName + "配置文件不存在");
}

const appConfig = parse(fs.readFileSync(configFilePath, { encoding: 'utf-8' }));

if (!fs.existsSync(appConfig.jwt.rsa_primary_key)) {
    throw new Error(appConfig.jwt.rsa_primary_key + "不存在，请输入正确的路径（若未生成秘钥时，请执行oauth/script/generateKeyPair.js脚本）");
}

module.exports = appConfig;
