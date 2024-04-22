const { ejs } = require("koa-ejs");
const fs = require("fs");

const { createTransporter } = require("../../../common/src/util/emailUtil");
const config = require("../config/appConfig");
const { CustomException, ClientException } = require("../../../common/src/exception");
const { generateCode } = require("../../../common/src/util/captcha");
const { client } = require("../config/redisHelper");
const { YOUR_APPROVAL_EMAIL_PREFIX, REDIS_OK } = require("../../../common/src/constants/general");

async function setEmailCode(email) {
    const transporter = createTransporter({
        host: config.email.host,
        port: +config.email.port,
        secure: Boolean(config.email.secure),
        username: config.email.username,
        password: config.email.password
    });
    const code = generateCode();
    const expiresIn = +config.email.expires_in;
    // 有可能会出现覆盖的情况；
    const resp = await client.set(`${YOUR_APPROVAL_EMAIL_PREFIX}${email}`, code, "EX", expiresIn * 60);
    if (REDIS_OK !== resp) {
        throw new CustomException();
    }
    try {
        const sendingResp = await transporter.sendMail({
            from: '" ' + config.server.name.toUpperCase() + ' " <' + config.email.username + '>',
            to: email,
            subject: `请查收您的验证码`,
            html: ejs.render(fs.readFileSync(config.rootDir + "/src/views/code1.ejs", { encoding: 'utf-8' }), { code, expiresIn }), // html body
        });
        console.log("sending email %s: ", sendingResp.messageId);
    } catch (error) {
        console.log(error);
        throw new CustomException({ message: '发送邮件失败' });
    }
}

async function verify(code, email) {
    const _code = await client.getdel(YOUR_APPROVAL_EMAIL_PREFIX + email);
    if (!_code || _code.toLocaleLowerCase() !== code.toLocaleLowerCase()) {
        throw new ClientException({ message: '验证码不正确或已失效' });
    }
}

module.exports = { setEmailCode, verify };