// const url = require('node:url');
/**
 * 拼接url
 * @param {String} baseUrl 初始url
 * @param {Object} queries 拼接的url参数
 * @returns {String}
 */
function joinUrl(baseUrl, queries) {
    // var urlObj = url.parse(base, true);
    const keys = Object.keys(queries);
    if (!keys.length) {
        return baseUrl;
    }
    const query = baseUrl.includes("?");
    let queryStr = "";
    for (const key of keys) {
        queryStr += `&${key}=${queries[key]}`;
    }
    // return url.format(urlObj);
    // 如果没有?时，将第一个&替换为?
    if (!query) {
        queryStr = queryStr.replace("&", "?");
    }
    return baseUrl + queryStr;
}

module.exports = {
    joinUrl
}
