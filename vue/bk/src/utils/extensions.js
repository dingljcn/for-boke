/*********************************************************************************************************************************************/
/*                                                                   String                                                                  */
/*********************************************************************************************************************************************/

/** 忽略大小写的比较是否相等 */
defunc(String.prototype, 'equalsIgnoreCase', function(another) {
    return another ? this.toLowerCase() == another.toLowerCase() : false;
});

/** 忽略大小写的判断是否有子串 */
defunc(String.prototype, 'includesIgnoreCase', function(another) {
    return another ? this.toLowerCase().includes(another.toLowerCase()) : false;
});

/** 快捷对字符串自身进行消息提示 */
defunc(String.prototype, 'info', function() {
    this.info(2000);
});

/** 快捷对字符串自身进行消息提示 */
defunc(String.prototype, 'info', function(timeout) {
    dinglj.info(this, timeout);
});

/** 快捷对字符串自身进行消息提示 */
defunc(String.prototype, 'info', function(timeout, top) {
    dinglj.info(this, timeout, top);
});

/** 快捷对字符串自身进行错误提示 */
defunc(String.prototype, 'err', function() {
    this.err(2000);
});

/** 快捷对字符串自身进行错误提示 */
defunc(String.prototype, 'err', function(timeout) {
    dinglj.err(this, timeout);
});

/** 快捷对字符串自身进行错误提示 */
defunc(String.prototype, 'err', function(timeout, top) {
    dinglj.err(this, timeout, top);
});

/** 快捷对字符串自身进行警告提示 */
defunc(String.prototype, 'warn', function() {
    this.warn(2000);
});

/** 快捷对字符串自身进行警告提示 */
defunc(String.prototype, 'warn', function(timeout) {
    dinglj.warn(this, timeout);
});

/** 快捷对字符串自身进行警告提示 */
defunc(String.prototype, 'warn', function(timeout, top) {
    dinglj.warn(this, timeout, top);
});

/*********************************************************************************************************************************************/
/*                                                                   Array                                                                   */
/*********************************************************************************************************************************************/

/** 忽略大小写, 获取某个元素的下标 */
defunc(Array.prototype, 'indexOfIgnoreCase', function(another) {
    // 字符串才忽略大小写的比较
    if (typeof another == 'string') {
        return another ? this.map(i => i.toLowerCase()).indexOf(another.toLowerCase()) : -1;
    }
    // 非字符串还是按基本的进行比较
    return this.indexOf(another);
});

/** 忽略大小写, 判断某个元素是否存在 */
defunc(Array.prototype, 'includesIgnoreCase', function(another) {
    return this.indexOfIgnoreCase(another) >= 0;
});

/** 适用于对象数组, 根据对象的某个属性, 获取对象的下标 */
defunc(Array.prototype, 'indexOfByProp', function(prop, exp) {
    if (prop) {
        for(let i = 0; i < this.length; i++) {
            if (this[i][prop] == exp) {
                return i;
            }
        }
    }
    return -1;
});

/** 适用于对象数组, 判断是否有哪个对象的某个属性是期望的值 */
defunc(Array.prototype, 'includesByProp', function(prop, exp) {
    return this.indexOfByProp(prop, exp) >= 0;
});

/** 移除某个元素, 返回是否删除成功 */
defunc(Array.prototype, 'remove', function(obj) {
    let idx = this.indexOf(obj);
    if (idx != -1) {
        this.splice(idx, 1);
        return true;
    }
    return false;
});

/** 移除某个元素, 返回是否删除成功 */
defunc(Array.prototype, 'pushNew', function(obj) {
    if(!this.includesIgnoreCase(obj)) {
        this.push(obj);
    }
    return this;
});