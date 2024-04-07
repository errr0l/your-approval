const { scopes } = require("../constants/oidc");
// 各权限范围对应的字段
const profileFields = ['name', 'username', 'avatar', 'nickname', 'preferred_username', 'introduction', 'picture', 'website', 'gender', 'birthdate', 'zoneinfo', 'locale', 'created_at'];
const emailFields = ['email', 'email_verified'];
const phoneFields = ['phone', 'phone_verified'];
const openidFields = ['id'];
const addressFields = ['address'];

// 权限范围包含其中的一个，则自动添加openid权限范围
const openidRule = new RegExp(Object.values(scopes).filter(item => item !== scopes.OPENID).join("|"));

function setValues(userinfo, fields, user) {
    for (const key of fields) {
        if (key in user) {
            userinfo[key] = user[key] || "";
        }
    }
}

/**
 * 根据scope构建用户信息
 * @param scopes
 * @param user
 */
function buildUserinfo(scopes, user) {
    const userinfo = {};
    for (const scope of scopes) {
        if (scope === scopes.OPENID) {
            setValues(userinfo, openidFields, user);
        }
        else if (scope === scopes.PROFILE) {
            setValues(userinfo, profileFields, user);
        }
        else if (scope === scopes.EMAIL) {
            setValues(userinfo, emailFields, user);
        }
        else if (scope === scopes.PHONE) {
            setValues(userinfo, phoneFields, user);
        }
        else if (scope === scopes.ADDRESS) {
            setValues(userinfo, addressFields, user);
        }
    }
    return userinfo;
}

module.exports = {
    buildUserinfo, openidRule
}