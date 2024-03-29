const { pool } = require("../config/DBHelper");

const { encodeWithMd5 } = require("../util/common");

const { ClientException } = require("../exception");

// 账号密码登录；
// username可以是用户名或邮箱
async function login(username, password) {

    const user = await selectByUsername(username);

    if (user) {
        if (encodeWithMd5(password) !== user.password) {
            return null;
        }
    }
    return user;
}

async function selectByUsername(username) {
    const sql = "select * from `user` where `username` = ? or `email` = ?";
    const [rows] = await pool.query(sql, [username, username]);
    return rows.length ? rows[0] : null;
}

// 注册账号；
// 用户名和邮箱必须唯一
async function register(user) {
    const _user = await selectByUsername(user.username);
    if (_user) {
        throw new ClientException({ message: '' });
    }
    const date = new Date();
    const sql = "insert into `user` (`username`, `password`, `avatar`, `created_at`, `email`, `state`, `introduction`) values (?, ?, ?, ?, ?, ?, ?)";

    const defaultState = 1;
    const [result] = await pool.query(sql, [user.username, encodeWithMd5(user.password), user.avatar, date, user.email, defaultState, ""]);
    return result.affectedRows === 1;
}

module.exports = {
    login
};