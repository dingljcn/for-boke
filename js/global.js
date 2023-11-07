import { LocalStorage } from "./entities/LocalStorage.js";

/** 获取属性, 没有则创建 */
export function computeIfAbsent(map, key, value) {
    if (map instanceof Map) {
        if (map.has(key)) {
            return map.get(key);
        } else {
            map.set(key, value);
        }
    } else {
        if (Object.keys().includes(key)) {
            return map[key];
        } else {
            map[key] = value;
        }
    }
    return value;
}

/** 对象转 json 字符串 */
export function stringify(data) {
    return JSON.stringify(data, (k, v) => {
        if (v instanceof RegExp) { // 正则表达式
            return `#(dinglj-regex){${ v.toString() }}`;
        }
        return v;
    })
}

/** json 字符串转对象 */
export function parseJson(jsonString) {
    let forRegExp = /^#\(dinglj-regex\){(.*)}$/;
    return JSON.parse(jsonString, (k, v) => {
        if (forRegExp.test(v)) {
            return eval(forRegExp.exec(v)[1]);
        }
        return v;
    });
}

/** 获取本地缓存 */
export function getLocalStorage(key) {
    let json = localStorage.getItem(key);
    if (json) {
        let obj = LocalStorage.byJson(parseJson(json));
        let now = Date.now();
        if (obj.timeout && (now - obj.saveTime > obj.timeout.getMilliSecond())) {
            console.error('data is timeout: ', obj);
            return {};
        }
        return obj.data;
    }
    return {};
}

export function setLocalStorage(key, data, timeout = null) {
    let obj = LocalStorage.createNew(data, timeout);
    localStorage.setItem(key, stringify(obj));
}