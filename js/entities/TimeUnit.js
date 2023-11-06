export class TimeUnit {
    /** 单位: second */
    unit = 'second';
    /** 数量 */
    second;
    /** 构造器 */
    constructor(second) {
        this.second = second;
    }
    /** 获取毫秒 */
    getMilliSecond() {
        return this.second * 1000;
    }
    /** 获取秒 */
    getSecond() {
        return this.second;
    }
    static Second(n = 0) {
        return new TimeUnit(n);
    }
    static Minute(n = 0) {
        return new TimeUnit(n * 60);
    }
    static Hour(n = 0) {
        return new TimeUnit(n * 60 * 60);
    }
    static Day(n = 0) {
        return new TimeUnit(n * 60 * 60 * 24);
    }
    static Week(n = 0) {
        return new TimeUnit(n * 60 * 60 * 24 * 7);
    }
    static Month(n = 0) {
        return new TimeUnit(n * 60 * 60 * 30);
    }
    static Year(n = 0) {
        return new TimeUnit(n * 60 * 60 * 365);
    }
}