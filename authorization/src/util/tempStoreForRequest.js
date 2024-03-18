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
        if (key in requestMap) {
            delete requestMap[key];
        }
        clearTimeout(timer);
    }, 1000 * 60 * 10);
}

// 获取并删除请求对象
function getRequest(key) {
    const req = requestMap[key];
    delete requestMap[key];
    return req;
}

module.exports = {
    getRequest, saveRequest
};

// 定时删除请求
// setInterval(() => {
//     console.log("定时清理请求任务正在运行...");
//     const keys = Object.keys(requestMap);
//
//     if (!keys.length) {
//         return;
//     }
//     const now = Date.now();
//     for (const k in requestMap) {
//         const req = requestMap[k];
//         if (now > req.expired) {
//             console.log("删除过期请求：" + req);
//             delete requestMap[k];
//         }
//     }
// }, 1000 * 60 * 60);