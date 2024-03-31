const { CustomException } = require("../exception");
const { errors } = require("../constants/oauth");

class SimpleMemoryStore {
    store = {};
    keys = [];
    ttl;
    timer;
    limit;

    /**
     * 构造器
     * @param {Number} ttl 保存对象存活时间（单位，秒）
     * @param {Number} limit 保存数量
     */
    constructor(ttl, limit) {
        this.ttl = ttl;
        this.limit = limit;
    }

    save(key, value) {
        if (this.keys.length > this.limit) {
            throw new CustomException({ message: errors.SERVER_BUSY });
        }
        // 设置过期时间
        const expiresIn = Date.now() + this.ttl;
        this.store[key] = { value, expiresIn };
        this.keys.push(key);

        // 设定过期时间
        if (!this.timer) {
            this.timer = setTimeout(() => {
                const current = Date.now();
                for (let _key of this.keys) {
                    const _valueObj = this._get(key);
                    if (_valueObj && _valueObj.expiresIn >= current) {
                        this._del(key);
                    }
                }
                clearTimeout(this.timer);
                this.timer = null;
                this.keys.length = 0;
            }, 1000 * this.ttl);
        }
    }

    _del(key) {
        delete this.store[key];
    }

    _get(key) {
        if (!this.check(key)) {
            return null;
        }
        return this.store[key];
    }

    get(key, deleting = true) {
        let valueObj = this._get(key);
        if (!valueObj) {
            return null;
        }
        const current = Date.now();
        // 删除过期请求
        if (valueObj.expiresIn >= current) {
            this._del(key);
            return null;
        }
        if (deleting) {
            this._del(key);
        }
        return valueObj.value;
    }

    check(key) {
        return (key in this.store);
    }
}

module.exports = SimpleMemoryStore;