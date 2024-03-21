// （暂时）保存请求工具函数
const requestMap = {};

/**
 * 保存请求；添加进map后，同时设置延迟器，在指定时间后删除请求对象；
 * @param {String} key 请求id
 * @param {Object} req 请求对象
 */
function saveRequest(key, req) {
    requestMap[key] = req;

    // 设定过期时间
    const timer = setTimeout(() => {
        if (checkRequest(key)) {
            delete requestMap[key];
        }
        clearTimeout(timer);
    }, 1000 * 60 * 10);
}

// 获取并删除请求对象
function getRequest(key, deleting = true) {
    const req = requestMap[key];
    if (deleting) {
        delete requestMap[key];
    }
    return req;
}

function checkRequest(key) {
    return (key in requestMap);
}

module.exports = {
    getRequest, saveRequest, checkRequest
};
