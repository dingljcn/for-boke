import { LocalStorage } from "./entities/LocalStorage.js";

export function computeIfAbsent(map, key, value) {
    if (map.has(key)) {
        return map.get(key);
    } else {
        map.set(key, value);
    }
    return value;
}

/** 对象转 json 字符串 */
export function stringify(data) {
    return JSON.stringify(data, (k, v) => {
        // 正则表达式特殊处理
        if (v instanceof RegExp) {
            return v.toString();
        }
        return v;
    })
}

/** json 字符串转对象 */
export function parseJson(jsonString) {
    return JSON.parse(jsonString, (k, v) => {
        if (eval(v) instanceof RegExp) {
            return eval(v);
        };
        return v;
    });
}

/** 获取本地缓存 */
export function getLocalStorage(key) {
    let json = localStorage.getItem(key);
    if (json) {
        obj = LocalStorage.byJson(parseJson(json));
        let now = Date.now();
        if (obj.timeout != -1 && (now - obj.saveTime > obj.timeout)) {
            console.error('data is timeout: ', obj);
            return {};
        }
        return obj.data;
    }
    return {};
}

export function setLocalStorage(key, data, timeout = -1) {
    let obj = LocalStorage.createNew(data, timeout);
    localStorage.setItem(key, stringify(obj));
}