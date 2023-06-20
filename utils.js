/** 判断当前网址是否启用脚本 */
function isMatch(config) {
    if (config.matchList) { // 如果存在要匹配的网址, 则匹配, 匹配成功才进入
        for (let stratege of config.matchList) {
            if (stratege.test(window.location.href)) {
                return true;
            }
        }
    } else { // 如果没有要匹配的网址, 默认是允许执行脚本
        return true;
    }
    return false; // 到这里说明存在要匹配的网址, 但匹配失败, 返回 false
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
