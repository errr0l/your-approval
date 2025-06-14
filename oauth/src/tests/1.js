const { pool } = require("../config/DBHelper");

const { encodeWithMd5 } = require("../../../common/src/util/common");
const { ClientException } = require("../../../common/src/exception");

// 账号密码登录；
// username可以是用户名或邮箱
async function login(username, password) {
    const sql = "select * from `user` where `username` = ? or `email` = ?";
    const [rows] = await pool.query(sql, [username, username]);
    const user = rows.length ? rows[0] : null;
    if (!user || encodeWithMd5(password) !== user.password) {
        throw new ClientException({ message: '用户名或密码不正确' });
    }
    user.password = "";
    return user;
}

login("error@qq.com", "1234").then(res => {
    console.log(res);
});