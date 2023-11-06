export class LocalStorage {
    /** 数据 */
    data;
    /** 保存时间 */
    saveTime; 
    /** 有效时长 */
    timeout;
    /** 构造器, 将 json 解析出的对象封装为 LocalStorage */
    static byJson(object) {
        let result = new LocalStorage();
        result.data = object.data;
        result.saveTime = object.saveTime;
        result.timeout = object.timeout;
        return result;
    }
    /** 构造器, 新对象封装为 LocalStorage */
    static createNew(object, timeout = -1) {
        let result = new LocalStorage();
        result.data = object;
        result.saveTime = Date.now();
        result.timeout = timeout;
        return result;
    }
}