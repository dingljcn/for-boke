import { LocalStorage } from "./entities/LocalStorage.js";

addCssLink('https://dingljcn.github.io/for-boke/js/dev/css/base.css');

/******************************** 导出的函数 start ********************************/

export function addCssLink(href) {
    let css = document.createElement('link');
    css.type = 'text/css';
    css.rel = 'stylesheet';
    css.href = href;
    document.head.appendChild(css);
}

/** 获取属性, 没有则创建 */
export function computeIfAbsent(map, key, value) {
    if (map instanceof Map) {
        if (map.has(key)) {
            return map.get(key);
        } else {
            map.set(key, value);
        }
    } else {
        if (Object.keys(map).includes(key)) {
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

/** 设置本地缓存 */
export function setLocalStorage(key, data, timeout = null) {
    let obj = LocalStorage.createNew(data, timeout);
    localStorage.setItem(key, stringify(obj));
}

/**
 * 在集合中找 prop = expectValue 的对象, 返回其下标
 * @param {any[]} list 对象集合
 * @param {string} prop 对象中某个属性的key
 * @param {any} expectValue 希望对象中某个属性等于的值
 * @returns 对象的下标
 */
export function indexOfPropInList(list = [], prop = '', expectValue) {
    for (let i = 0; i < list.length; i++) {
        if (list[i][prop] == expectValue) {
            return i;
        }
    }
    return -1;
}

/**
 * 在集合中找 prop = expectValue 的对象
 * @param {any[]} list 对象集合
 * @param {string} prop 对象中某个属性的key
 * @param {any} expectValue 希望对象中某个属性等于的值
 * @returns 所有符合条件的集合
 */
export function findByPropInList(list = [], prop = '', expectValue) {
    return list.filter(obj => obj[prop] == expectValue);
}

/**
 * 生成 uuid
 * @param {string} prefix 前缀
 * @param {number} length 随机数长度
 */
export function uuid(prefix = '', length = 8) {
    return `${ prefix }-${ ('' + (Math.random() * 10000000)).replace('.', '').substring(0, length) }`
}

/**
 * 简单的 get 请求
 * @param {string} path 完整地址或相对地址
 * @param {Function} callback 回调函数
 */
export function get(path = '', sync = false, callback = res => {}) {
    const http = new XMLHttpRequest();
    http.open('GET', path, sync);
    http.send();
    if (http.readyState == 4 && http.status == 200 && callback) {
        callback(http.responseText);
    }
    return http.responseText;
}

/** callback: 传入数组中的一个元素, 返回 key */
export function groupBy(list = [], prop, callback = null) {
    let result = {};
    for (let item of list) {
        let key = callback == null ? item[prop] : callback(item);
        let array = result[key];
        if (!array) {
            array = [];
            result[key] = array;
        }
        array.push(item);
    }
    return result;
}

/** 绘制选择控件 */
export function generateSelect(id, list = [], config = {
    callback: '',
    defaultValue: '请选择',
    className: ''
}) {
    let callback = config.callback || '';
    let defaultValue = config.defaultValue || '请选择';
    let className = config.className || '';
    return `<div class="dinglj-select-container ${ className }" id="${ id }">
        <div class="select-value" id="${ id }-value">${ defaultValue }</div>
        <div class="select-items" id="${ id }-items">${ 
            list.map(val => {
                let elementId = `${ id }-select-${ val }`;
                return `<div class="select-item" id="${ elementId }" onclick="onSelectionChange('${ callback }', '${ elementId }')">${ val }</div>`
            }).join('')
        }</div>
    </div>`;
}

/** 获取选择控件的值 */
export function getSelectValue(id) {
    return getById(id).children[0].innerText
}

/** 从父元素的子节点中, 选取包含指定 class 的元素集合进行返回 */
export function getChildrenByClassName(parent, className) {
    let result = [];
    if (parent) {
        for (let element of parent.children) {
            if (element.classList.contains(className)) {
                result.push(element);
            }
        }
    }
    return result;
}

/** 获取今天是周几 */
export function getWeek(date = new Date(), prefix = '星期') {
    let flag = date.getDay();
    switch(flag) {
        case 0: return `${ prefix }日`;
        case 1: return `${ prefix }一`;
        case 2: return `${ prefix }二`;
        case 3: return `${ prefix }三`;
        case 4: return `${ prefix }四`;
        case 5: return `${ prefix }五`;
        case 6: return `${ prefix }六`;
    }
}

/** 获取年月日 */
export function getDate() {
    let date = new Date();
    return `${ date.getFullYear() }-${ date.getMonth() + 1 }-${ date.getDate() }`;
}

/** 获取时分秒, 毫秒 */
export function getTime() {
    let date = new Date();
    return `${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() }, ${ date.getMilliseconds() }`
}

/** 根据 id 移除元素, 不存在则不移除 */
export function remById(idList = []) {
    if (typeof idList == 'string') {
        idList = [ idList ];
    }
    idList.forEach(id => {
        let element = getById(id);
        if (element) {
            element.remove();
        }
    });
}

/******************************** 导出的函数 end ********************************/

/******************************** 全局的函数 start ********************************/

/** 选择控件的选项被点击时调用 */
window.onSelectionChange = function (callback, id) {
    let click = getById(id);
    let val = click.parentNode.previousElementSibling;
    val.innerText = click.innerText.trim();
    if (callback.trim()) {
        eval(`${ callback }('${ val.innerText }')`);
    }
}

/* 复制文本到剪贴板 */
window.copyText = function (text = '') {
    let old = document.getElementById('dinglj-copy-container');
    if (old) {
        old.remove();
    }
    let box = document.createElement('div');
    box.innerHTML = 
    `<div id="dinglj-copy-container">
        <div id="dinglj-copy-success">
            已复制: 
        </div>
        <span id="dinglj-copy-content">${ text }</span>
        <div id="dinglj-copy-nav"></div>
    </div>`;
    let element = box.children[0];
    document.body.appendChild(element);
    let range = document.createRange();
    range.selectNodeContents(document.getElementById('dinglj-copy-content'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("Copy", false, null);
    selection.removeAllRanges();
    setTimeout(() => {
        element.remove();
    }, 3000);
}

/** 根据 id 获取 html 元素 */
window.getById = function (id) {
    return document.getElementById(id);
}

/** 根据 class 获取 html 元素 */
window.getByClass = function (className) {
    let result = [];
    result.push(...document.getElementsByClassName(className))
    return result;
}

/******************************** 全局的函数 end ********************************/