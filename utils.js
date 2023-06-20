/** 读取配置 */
function readConfig(onSuccess = null) {
    if (onSuccess == null) {
        alert('readConfig 未传入回调方法');
        return;
    }
    // 非阻塞读取配置, 一定要读取到配置才执行脚本
    let timer = setInterval(() => {
        let data = localStorage.getItem('dinglj-script-config');
        if (data) {
            let config = JSON.parse(data);
            // 如果存在要匹配的网址, 则匹配, 匹配成功才进入
            if (config.matchList) {
                for (let matchStratege of config.matchList) {
                    if (matchStratege.test(window.location.href)) {
                        onSuccess(config);
                    }
                }
            }
            clearInterval(timer);
        }
    }, 10);
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
