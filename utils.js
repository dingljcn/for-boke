/** 判断当前网址是否启用脚本 */
function isMatch(config) {
    // 如果存在要匹配的网址, 则匹配, 匹配成功才进入
    if (config.matchList) {
        for (let stratege of config.matchList) {
            if (stratege.test(window.location.href)) {
                return true;
            }
        }
    }
    return false;
}

/** 对象转 json 字符串 */
function stringify(data) {
    return JSON.stringify(data, (k, v) => {
        // 正则表达式特殊处理
        if (v instanceof RegExp) {
            return v.toString();
        }
        return v;
    })
}

/** json 字符串转对象 */
function parseJson(jsonString) {
    return JSON.parse(jsonString, (k, v) => {
        if (eval(v) instanceof RegExp) {
            return eval(v);
        };
        return v;
    });
}
