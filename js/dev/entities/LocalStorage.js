import { TimeUnit } from './TimeUnit.js'

export class LocalStorage {
    /** @type { any } 数据 */
    data;
    /** @type { number } 保存时间 */
    saveTime; 
    /** @type { TimeUnit } 有效时长 */
    timeout;
    /** 构造器, 将 json 解析出的对象封装为 LocalStorage */
    static byJson(object) {
        let result = new LocalStorage();
        result.data = object.data;
        result.saveTime = object.saveTime;
        result.timeout = TimeUnit.copy(object.timeout);
        return result;
    }
    /** 构造器, 新对象封装为 LocalStorage */
    static createNew(object, timeout = null) {
        let result = new LocalStorage();
        result.data = object;
        result.saveTime = Date.now();
        result.timeout = timeout;
        return result;
    }
}