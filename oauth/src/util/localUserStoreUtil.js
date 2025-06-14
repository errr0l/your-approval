const path = require("path");
const fs = require("fs");

const storePath = path.join(__dirname, "../store/user.json");


// 返回true表示未过期
const valid = (ttl) => Date.now() < ttl;

/**
 * 以json对象的形式写入磁盘
 * @param {Object} key session_token
 * @param {Object} user 
 * @param {Number} ttl 存活时间（有效时间；为至今的毫秒数）
 */
function saveToDisk(key, user, ttl) {
    let users;
    if (fs.existsSync(storePath)) {
        users = JSON.parse(fs.readFileSync(storePath, "utf-8"));

        // 清理过期
        if (Math.floor(Math.random() * 10 + 1) > 5) {
            users = users.filter(item => valid(item.ttl))
        }
    }
    else {
        users = [];
    }
    users.push({
        [key]: {
            user,
            ttl
        }
    });
    writeFile(JSON.stringify(users));
}

function writeFile(content) {
    fs.writeFileSync(storePath, content, "utf-8");
}

// 如果已过期时，要求重新认证
function readFromDisk(key) {
    const users = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    const user = users[key];

    if (user) {
        if (valid(user.ttl)) {
            return user;
        }
        else {
            delete users[key];
            writeFile(JSON.stringify(users));
        }
    }
    // 过期或不存在
    return null;
}

module.exports = {
    readFromDisk, saveToDisk
};