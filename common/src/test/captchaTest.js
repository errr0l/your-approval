const { run } = require("./runner");
const { generateCaptcha } = require("../util/captcha");

function test1() {
    const base64 = generateCaptcha("123");
    console.log(base64);
}

run([test1]);

