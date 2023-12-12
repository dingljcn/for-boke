window.dinglj = {};

/** 定义重载的函数 */
window.defunc = function(object, name, func) {
    const old = object[name];
    object[name] = function(...args) {
        if (args.length === func.length) {
            return func.apply(this, args);
        } else if (typeof old === 'function') {
            return old.apply(this, args);
        }
    }
}

/** 生成 uuid */
defunc(window.dinglj, 'uuid', function() {
    return dinglj.uuid('uuid', 10);
});

/** 生成 uuid */
defunc(window.dinglj, 'uuid', function(prefix) {
    return dinglj.uuid(prefix, 10)
});

/** 生成 uuid */
defunc(window.dinglj, 'uuid', function(prefix, length) {
    const randomNumber = Math.random() * 10000000;
    const subNumber = ('' + randomNumber).replace('.', '').substring(0, length);
    return `${ prefix }-${ subNumber }`;
});

/** 同步加载 css 样式 */
defunc(window.dinglj, 'linkCss', function (href) {
    let styleElement = document.createElement('style');
    styleElement.innerHTML = dinglj.get(`${ window.dinglj_home }${ href }`);
    document.head.appendChild(styleElement);
});

/** 重载定义 groupBy, exp 如果是 string, 则取该属性名, 如果是 function, 则调用取 key */
defunc(window.dinglj, 'groupBy', (list, exp) => {
    let result = {};
    list.forEach(item => {
        let key = '';
        if (typeof exp == 'string') {
            key = item[exp];
        } else if (typeof exp == 'function') {
            key = exp(item);
        }
        if (result[key]) {
            result[key].push(item);
        } else {
            result[key] = [ item ];
        }
    });
    return result;
});

/** 根据选择器获取 DOM 元素 */
defunc(window.dinglj, 'query', (keyword) => {
    let result = [];
    result.push(...document.querySelectorAll(keyword));
    return result;
});

/** 根据 class 获取 DOM 元素 */
defunc(window.dinglj, 'byClass', (keyword) => {
    let result = [];
    result.push(...document.getElementsByClassName(keyword));
    return result;
});

/** 根据 id 获取 DOM 元素 */
defunc(window.dinglj, 'byId', (keyword) => {
    return document.getElementById(keyword);
});

/** 发送 get 请求 */
defunc(window.dinglj, 'get', (url) => {
    return dinglj.get(url, undefined);
});

/** 发送 get 请求 */
defunc(window.dinglj, 'get', (url, callback) => {
    return dinglj.get(url, callback, false);
});

/** 发送 get 请求 */
defunc(window.dinglj, 'get', (url, callback, sync) => {
    const http = new XMLHttpRequest();
    http.open('GET', url, sync);
    http.send();
    if (callback && http.readyState == 4 && http.status == 200) {
        callback(http.responseText);
    }
    return http.responseText;
});

/** 获取配置, 如果取不到则返回默认值 */
defunc(window.dinglj, 'getConfig', (data, path, _default) => {
    return dinglj.getConfig(data, path, _default, false);
});

/** 获取配置, 如果取不到则返回默认值, 并根据参数确认是否要报错 */
defunc(window.dinglj, 'getConfig', (data, path, _default, error) => {
    let result = data;
    for (let propName of path.split('.')) {
        result = result[propName];
        if (!result) { // 如果取不到值, 则报错并返回默认值
            if (error) {
                console.error(`${ path }: 配置不存在, 请检查脚本`);
            }
            return _default
        }
    }
    return result;
});

/** 获取配置, 或从默认配置中取, 默认配置也没有, 则返回默认值 */
defunc(window.dinglj, 'getConfigOrDefault', (config, defaultConfig, path, _default) => {
    return dinglj.getConfigOrDefault(config, defaultConfig, path, _default, true);
});

/** 获取配置, 或从默认配置中取, 默认配置也没有, 则返回默认值 */
defunc(window.dinglj, 'getConfigOrDefault', (config, defaultConfig, path, _default, merge) => {
    let config1 = dinglj.getConfig(config, path, 'NOT_FOUND');
    let config2 = dinglj.getConfig(defaultConfig, path, 'NOT_FOUND');
    let result = 'NOT_FOUND';
    if (config1 != 'NOT_FOUND') { // 还是优先考虑用户的配置吧
        if (Array.isArray(config1)) {
            result = [];
            result.push(...config1);
        } else if (typeof config1 == 'object') {
            result = {};
            for (let key of Object.keys(config1)) {
                result[key] = config1[key];
            }
        } else {
            return config1;
        }
    }
    if (config2 != 'NOT_FOUND') {
        if (result == 'NOT_FOUND') {
            // config1 没数据, 则完全使用 config2
            return config2;
        } else if (Array.isArray(config1)) {
            // config1 是数组, 要求 config2 也是数组, 否则无法合并
            if (Array.isArray(config2) && merge) {
                result.push(...config2);
            }
        } else if (typeof config2 == 'object' && merge) {
            // config1 到这里一定是 object, 要求 config2 也是 object, 否则无法合并
            for (let key of Object.keys(config2)) {
                if (result[key] == undefined) {
                    result[key] = config2[key];
                }
            }
        }
    }
    if (result == 'NOT_FOUND') { // 仍然没有则直接报错, 并返回默认值
        result = _default;
        console.error(`${ path }: 配置不存在, 请检查脚本`);
    }
    return result;
});

/** 有一个排好序的数组, 给定两个字符串, 比较出这两个字符串的大小 */
defunc(window.dinglj, 'compareStringByArray', (array, o1, o2) => {
    let idx1 = array.indexOfIgnoreCase(o1) == -1 ? 9999 : array.indexOfIgnoreCase(o1);
    let idx2 = array.indexOfIgnoreCase(o2) == -1 ? 9999 : array.indexOfIgnoreCase(o2);
    if (idx1 == idx2) {
        return o1 < o2 ? -1 : (o1 > o2 ? 1 : 0);
    }
    return idx1 - idx2;
});

/** 判断是不是开发模式 */
defunc(window.dinglj, 'isDev', () => {
    return window.dingljenv && window.dingljenv.toLowerCase().trim() == 'dev';
});

/** 计算文本宽度 */
defunc(window.dinglj, 'calcTxtWidth', (item) => {
    if (typeof item == 'string') {
        return dinglj.calcTxtWidth(item, '400', '12px', '微软雅黑');
    } else {
        if (!item) {
            return 0;
        }
        const computedStyle = window.getComputedStyle(item);
        return dinglj.calcTxtWidth(item.innerText, computedStyle.fontWeight, computedStyle.fontSize, computedStyle.fontFamily);
    }
});

/** 计算文本宽度 */
defunc(window.dinglj, 'calcTxtWidth', (txt, fontWeight, fontSize, fontFamily) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${ fontWeight } ${ fontSize } ${ fontFamily }`;
    const { width } = ctx.measureText(txt);
    return parseInt(width);
});

/** 移除原有的样式 */
defunc(window.dinglj, 'remCss', () => {
    dinglj.query('link').forEach(i => {
        if (i.href.includesIgnoreCase('.css')) {
            i.remove();
        }
    });
    dinglj.query('style').forEach(i => {
        i.remove();
    });
});

/** 根据id删除DOM节点 */
defunc(window.dinglj, 'remById', id => {
    let element = document.getElementById(id);
    if (element) {
        element.remove();
    }
});

/** 向对象的某个属性(数组)追加元素 */
defunc(window.dinglj, 'pushToObj', (obj, fieldName, value) => {
    if (obj[fieldName]) {
        obj[fieldName].push(value);
    } else {
        obj[fieldName] = [ value ];
    }
});

/** 向对象的某个属性(数组)插入元素(下标最前面) */
defunc(window.dinglj, 'unshiftToObj', (obj, fieldName, value) => {
    if (obj[fieldName]) {
        obj[fieldName].unshift(value);
    } else {
        obj[fieldName] = [ value ];
    }
});

/** 获取本地缓存 */
defunc(window.dinglj, 'getStorage', key => {
    return dinglj.getStorage(key, undefined);
});

/** 获取本地缓存 */
defunc(window.dinglj, 'getStorage', (key, _default) => {
    let json = localStorage.getItem(key);
    if (json) {
        const result = JSON.parse(json);
        if (result.timeout > 0 && (Date.now() - result.savetime > result.timeout)) {
            `本地缓存${ key }已过期`.warn();
            return _default;
        }
        return result.data;
    }
    return _default;
});

/** 设置本地缓存 */
defunc(window.dinglj, 'setStorage', (key, value) => {
    return dinglj.setStorage(key, value, -1);
});

/** 设置本地缓存 */
defunc(window.dinglj, 'setStorage', (key, value, timeout) => {
    let obj = {
        savetime: Date.now(),
        timeout: timeout,
        data: value,
    }
    localStorage.setItem(key, JSON.stringify(obj));
});

/** 根据 class 找兄弟DOM节点 */
defunc(window.dinglj, 'findBroByClass', (me, _class) => {
    let list = me.parentNode.children;
    for(let i = 0; i < list.length; i++) {
        if (list[i] == me) {
            continue;
        }
        if (list[i].classList.contains(_class)) {
            return list[i];
        }
    }
    return null;
});

/** 根据 class 找孩子DOM节点 */
defunc(window.dinglj, 'findChildrenByClass', (parent, _class) => {
    let result = [];
    let list = parent.children;
    for(let i = 0; i < list.length; i++) {
        if (list[i].classList.contains(_class)) {
            result.push(list[i]);
        }
    }
    return result;
});

/** 根据 class 找孩子DOM节点 */
defunc(window.dinglj, 'indexOfChildByClass', (parent, _class) => {
    let list = parent.children;
    for(let i = 0; i < list.length; i++) {
        if (list[i].classList.contains(_class)) {
            return i;
        }
    }
    return -1;
});

/** 注入用户自定义的 css */
defunc(window.dinglj, 'injectUserCss', () => {
    const config = readConfig();
    const css = dinglj.getConfig(config, 'css', '');
    let styleElement = document.createElement('style');
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
});

/** 复制文字 */
defunc(window.dinglj, 'copyTxt', (text) => {
    let target = document.createElement('div');
    target.innerText = text;
    target.style.opacity = 0;
    document.body.appendChild(target);
    let range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.addRange(range);
    document.execCommand("Copy", false, null);
    selection.removeAllRanges();
    `已复制: ${ text }`.info();
    target.remove();
});

/** 获取按钮的样式 */
defunc(window.dinglj, 'styleForBtn', size => {
    return {
        '--height': size.equalsIgnoreCase('small') ? '24px' : (size.equalsIgnoreCase('normal') ? '28px' : '32px'),
        '--contrl-margin-tb': size.equalsIgnoreCase('small') ? '1px' : (size.equalsIgnoreCase('normal') ? '3px' : '4px'),
    };
});


defunc(window.dinglj, 'timer', (func) => {
    dinglj.timer(func, 30);
})

defunc(window.dinglj, 'timer', (func, time) => {
    time = time < 30 ? 30 : time;
    let timer = setInterval(() => {
        if (func()) {
            clearInterval(timer);
        }
    }, time);
})