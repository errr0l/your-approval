const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
// const config = require("../config/appConfig");

// 生成公钥和私钥；
// 私钥用于授权服务器颁发id_token，公钥则用于客户端的校验；
// 注意，每次执行该脚本时，都会重新生成钥匙串，此前已经在使用的客户端也必须要换上新的公钥，所以请谨慎执行；
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // 密钥长度
    publicKeyEncoding: {
        type: 'spki',      // 公钥编码格式
        format: 'pem'      // 公钥文件格式
    },
    privateKeyEncoding: {
        type: 'pkcs8',     // 私钥编码格式
        format: 'pem',     // 私钥文件格式
    }
});

try {
    const dir = path.resolve(process.cwd(), './secrets');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(dir + '/rsa_private_key.pem', privateKey);
    fs.writeFileSync(dir + '/rsa_public_key.pem', publicKey);
} catch (error) {
    console.log(error);
}
