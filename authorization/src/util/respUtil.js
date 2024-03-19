const MIME_HTML = "text/html";
const MIME_JSON = "application/json";
const MIME_WIDE = "*/*";

const supportedMIMETypes = [MIME_HTML, MIME_JSON, MIME_WIDE];

// 获取权重
// 默认权重是1
function getQuantify(MIMEType) {
    const values = MIMEType.split(";");
    for (let i=1; i<values.length; i++) {
        const [k, v] = values[i].split("=");
        if (k === "q") {
            return +v;
        }
    }
    return 1;
}

// 获取最佳的MIME类型
function getBestMIMEType(accept) {
    const MIMETypes = accept.split(',');
    let best, quantity;
    for (const MIMEType of MIMETypes) {
        for (const supportedMIMEType of supportedMIMETypes) {
            if (MIMEType.startsWith(supportedMIMEType)) {
                let _quantity;
                if (best) {
                    _quantity = getQuantify(MIMEType);
                    if (quantity < _quantity) {
                        best = supportedMIMEType;
                        quantity = _quantity;
                    }
                }
                else {
                    best = supportedMIMEType;
                    _quantity = getQuantify(MIMEType);
                    quantity = _quantity;
                }
                if (_quantity && _quantity === 1) {
                    return best;
                }
            }
        }
    }
    return best ? best : MIME_JSON;
}

module.exports = { getBestMIMEType, MIME_HTML, MIME_JSON, MIME_WIDE };