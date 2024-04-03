const { pool } = require("../config/DBHelper");

const { encodeWithMd5 } = require("../util/common");

const { ClientException } = require("../exception");

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

async function selectByUsernameOrEmail(username, email) {
    const sql = "select * from `user` where `username` = ? or `email` = ?";
    const [rows] = await pool.query(sql, [username, email]);
    return rows.length ? rows[0] : null;
}

async function getUserById(id) {
    const sql = "select * from `user` where `id` = ?";
    const [rows] = await pool.query(sql, [id]);
    const user = rows.length ? rows[0] : null;
    if (user) {
        user.password = "";
    }
    return user;
}

// 注册账号；
// 用户名和邮箱必须唯一
async function register(user) {
    const { username, password, email } = user;
    const _user = await selectByUsernameOrEmail(username, email);
    if (_user) {
        if (_user.username === username) {
            throw new ClientException({ message: '该用户名已经存在' });
        }
        else {
            throw new ClientException({ message: '该用邮箱已经被使用' });
        }
    }
    const date = new Date();
    const sql = "insert into `user` (`username`, `password`, `avatar`, `created_at`, `email`, `state`, `introduction`) values (?, ?, ?, ?, ?, ?, ?)";

    const defaultState = 1;
    const [result] = await pool.query(sql, [username, encodeWithMd5(password), "", date, email, defaultState, ""]);
    return result.affectedRows === 1;
}

module.exports = {
    login, register, getUserById
};