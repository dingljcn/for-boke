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

/* 复制文本到剪贴板 */
function copyText(text = '') {
    let old = document.getElementById('dinglj-tip-container');
    if (old) {
        old.remove();
    }
    let box = document.createElement('div');
    box.innerHTML = `<div id="dinglj-tip-container" style="padding: 10px; border-radius: 5px; box-shadow: 0 0 7px -2px grey; font-size: 12px; text-indent: 10px; position: fixed; right: 20px; word-warp: word-break; text-align: left; background: rgba(255, 255, 255, 0.9); top: 20px; font-weight: bold">
        <div style="display: inline-block; vertical-align: top;margin-right: 10px">
            已复制: 
        </div>
        <span id="dinglj-tip" style="text-indent: 0px; display: inline-block; word-break: break-word; padding-right: 20px">
            ${ text }
        </span>
        <div style="width: 5px; height: calc(100% - 10px); background: #4DAFF9; position: absolute; top: 5px; left: 5px"></div>
    </div>`;
    let element = box.children[0];
    document.body.appendChild(element);
    let range = document.createRange();
    range.selectNodeContents(document.getElementById('dinglj-tip'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("Copy", false, null);
    selection.removeAllRanges();
    setTimeout(() => {
        element.remove();
    }, 3000);
}

/** 创建一个 html 元素, 并初始化相关属性、样式 */
function newElement(tag = '', config = {
    parentNode: undefined,
    front: false,
}, props = {}, styles = {}) {
    if (tag == '') {
        return null;
    }
    let element = document.createElement(tag);
    // 存在上级目录, 添加到上级目录
    if (config.parentNode) {
        // 是不是在前面插入
        if (config.front) {
            config.parentNode.insertBefore(element, config.parentNode.children[0]);
        } else {
            config.parentNode.appendChild(element);
        }
    }
    // 初始化相关属性
    for (let key of Object.keys(props)) {
        element[key] = props[key];
    }
    // 初始化相关样式
    for (let key of Object.keys(styles)) {
        element.style[key] = styles[key];
    }
    return element;
}