// 各权限范围对应的字段
const profileFields = ['name', 'avatar', 'nickname', 'preferred_username', 'introduction', 'picture', 'website', 'gender', 'birthdate', 'zoneinfo', 'locale', 'created_at'];
const emailFields = ['email', 'email_verified'];
const phoneFields = ['phone', 'phone_verified'];
const openidFields = ['id'];
const addressFields = ['address'];

function setValues(userinfo, fields, user) {
    for (const key of fields) {
        const value = user[key];
        if (value) {
            userinfo[key] = value;
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
        if (scope === "openid") {
            setValues(userinfo, openidFields, user);
        }
        else if (scope === "profile") {
            setValues(userinfo, profileFields, user);
        }
        else if (scope === "email") {
            setValues(userinfo, emailFields, user);
        }
        else if (scope === "phone") {
            setValues(userinfo, phoneFields, user);
        }
        else if (scope === "address") {
            setValues(userinfo, addressFields, user);
        }
    }
    return userinfo;
}

module.exports = {
    buildUserinfo
}