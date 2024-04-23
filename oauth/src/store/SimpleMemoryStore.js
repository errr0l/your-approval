const { CustomException } = require("../../../common/src/exception");
const { errors } = require("../constants/oauth");

// 一个简易的基于内存的key-value存储器；
// 该存储器会自动清除超时的key；
class SimpleMemoryStore {
    store = {}; keys = []; ttl;
    timer; limit;

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
        if (this.keys.length >= this.limit) {
            throw new CustomException({ message: errors.SERVER_BUSY });
        }
        // 设置过期时间
        const expiresIn = Date.now() + this.ttl * 1000;
        this.store[key] = { value, expiresIn };
        this.keys.push(key);

        // 设定过期时间
        if (!this.timer) {
            this.timer = setTimeout(() => {
                console.log("[SimpleMemoryStore]执行清理任务...");
                const current = Date.now();
                const _keys = [];
                for (let _key of this.keys) {
                    const _valueObj = this._get(key);
                    // 获取不到说明已经被删除了，此时无需再理会；
                    // 只需保留未过期的key；
                    if (_valueObj) {
                        if (_valueObj.expiresIn <= current) {
                            console.log("[SimpleMemoryStore]清理过期的key：" + key);
                            this._del(key);
                        }
                        else {
                            _keys.push(key);
                        }
                    }
                }
                clearTimeout(this.timer);
                this.timer = null;
                // this.keys.length = 0;
                this.keys = _keys;
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
        if (valueObj.expiresIn <= current) {
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