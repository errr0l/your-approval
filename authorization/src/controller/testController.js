const Router = require('koa-router');
const fs = require("fs");
const path = require("path");
const { parse } = require('ini');
const { grantTypes } = require("../constants/oauth");
const { ClientException } = require("../exception");
const axios = require("axios");
const Decryptor = require("../util/WXBizDataCrypt");
// 在secrets文件夹下创建miniprogram_config.ini文件，并输入小程序的id和秘钥；
const miniprogramConfig = parse(fs.readFileSync(path.resolve(process.cwd(), "./secrets/miniprogram-config.ini"), { encoding: 'utf-8' }));
const miniprogram1 = miniprogramConfig.miniprogram1;

const router = new Router({ prefix: "/test" });

const { codeStore, requestStore } = require("../store");

router.get("/", async (ctx) => {
    await ctx.render("test");
});

// 获取微信小程序用户信息（登陆？）；
// 就目前来看，调用接口有用的信息只有openid和session_key；
// 解密出来的信息，跟前端使用api获取到的信息一模一样，只有名称和头像。。
router.post("/miniprogram/login", async (ctx, next) => {
    const { code, encryptedData, iv, signature } = ctx.request.body;
    if (!code) {
        throw new ClientException();
    }

    let userinfo;
    try {
        const resp = await axios.get("https://api.weixin.qq.com/sns/jscode2session", {
            params: {
                appid: miniprogram1.appid,
                secret: miniprogram1.secret,
                js_code: code,
                grant_type: grantTypes.AUTHORIZATION_TYPE
            }
        });
        if (resp.status === 200) {
            const respData = resp.data; // openid, session_key
            const decryptor = new Decryptor(miniprogram1.appid, respData.session_key);
            userinfo = decryptor.decryptData(encryptedData, iv);
        }
    } catch (error) {
        console.log(error);
        throw new ClientException({ message: error.message });
    }
    ctx.body = { error: "", payload: userinfo};
});

router.get("/storeInfo", (ctx, next) => {
    ctx.body = {
        error: '', payload: {
            codeStore,
            requestStore
        }
    };
});

module.exports = router;