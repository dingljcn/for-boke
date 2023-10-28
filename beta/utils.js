class LangItem {
    en; zh;
    constructor(en = '', zh = '') {
        this.en = en;
        this.zh = zh;
    }
}

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

/**
 * 向 obj 中添加一个名为 fieldKey 的数组, 并将 data 添加到该数组
 * @param {any} obj 被赋值的对象
 * @param {string} fieldKey 字段名/属性名
 * @param {any} data 要赋值的值
 */
function pushToProp(obj, fieldKey, data) {
    let list = obj[fieldKey];
    if (!list) {
        // 不存在, 创建
        list = [];
        obj[fieldKey] = list;
    }
    list.push(data);
}

/**
 * 在集合中找 prop = expectValue 的对象, 返回其下标
 * @param {any[]} list 对象集合
 * @param {string} prop 对象中某个属性的key
 * @param {any} expectValue 希望对象中某个属性等于的值
 * @returns 对象的下标
 */
function indexOfPropInList(list = [], prop = '', expectValue) {
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
function findByPropInList(list = [], prop = '', expectValue) {
    return list.filter(obj => obj[prop] == expectValue);
}

/** 根据 id 获取 html 元素 */
function getById(id) {
    return document.getElementById(id);
}

/** 根据 class 获取 html 元素 */
function getByClass(className) {
    let result = [];
    result.push(...document.getElementsByClassName(className))
    return result;
}

/**
 * 生成 uuid
 * @param {string} prefix 前缀
 * @param {number} length 随机数长度
 */
function uuid(prefix = '', length = 8) {
    return `${ prefix }-${ ('' + (Math.random() * 10000000)).replace('.', '').substring(0, length) }`
}

/**
 * 适用于目录切换的场景, 某一批 className 一样的元素, 点击其中一个, 为它设置独特的样式, 并触发点击事件
 * @param {Element[]} elements 元素列表
 * @param {any} activeStyle 激活时的样式
 * @param {any} inActiveStyle 未激活时的样式
 * @param {Function} onClick 点击之后触发的事件
 */
function listActiveChange(elements = [], activeStyle = {}, inActiveStyle = {}, onClick = (element, event) => {}) {
    // 给每个元素添加点击事件
    for (let element of elements) {
        element.addEventListener('click', event => {
            // 先切换样式
            toggleStyle(elements, element, activeStyle, inActiveStyle);
            // 再激活点击事件
            onClick(element, event);
        })
    }
}

function toggleStyle(elements = [], element, activeStyle = {}, inActiveStyle = {}) {
    // 先把所有样式都设置为未激活
    for (let item of elements) {
        for (let styleKey of Object.keys(inActiveStyle)) {
            item.style[styleKey] = inActiveStyle[styleKey];
        }
    };
    // 再把点击的当前元素样式设置为激活
    for (let styleKey of Object.keys(activeStyle)) {
        element.style[styleKey] = activeStyle[styleKey];
    }
}

/** 设置一对鼠标事件: 移入/移出 */
function mouseIOEvent(elements = [], mouseIn, mouseOut) {
    for (let element of elements) {
        element.addEventListener('mouseover', event => {
            mouseIn(element, event);
        });
        element.addEventListener('mouseout', event => {
            mouseOut(element, event);
        });
    }
}

function getChildrenByClassName(parent, className) {
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

function setStyleByClassName(className, key, value) {
    for (let element of getByClass(className)) {
        element.style[key] = value;
    }
}

function setMultiStyleToMultiClass(classNames = [], style) {
    for (let className of classNames) {
        for (let element of getByClass(className)) {
            for (let key of Object.keys(style)) {
                element.style[key] = style[key];
            }
        }
    }
}

/**
 * 从原单位转为分钟
 * @param {number} number 数量
 * @param {sec|min|hour|day|week|month|year} originUnit 原单位
 */
function toSecond(number = 0, originUnit = 'hour') {
    switch(originUnit) {
        case 'year': return number * 60 * 60 * 24 * 365; // 一年 365 天
        case 'month': return number * 60 * 60 * 24 * 30;  // 一个月 30 天
        case 'week': return number * 60 * 60 * 24 * 7; // 一周 7 天
        case 'day': return number * 60 * 60 * 24; // 一天 24 小时
        case 'hour': return number * 60 * 60; // 一小时 60 分钟
        case 'min': return number * 60; // 一分钟 60 秒
        case 'sec': return number;
    }
}

/**
 * 简单的 get 请求
 * @param {string} path 完整地址或相对地址
 * @param {Function} callback 回调函数
 */
function get(path = '', sync = false, callback = res => {}) {
    const http = new XMLHttpRequest();
    http.open('GET', path, sync);
    http.send();
    if (http.readyState == 4 && http.status == 200) {
        callback(http.responseText);
    }
    return http.responseText;
}

function log(obj) {
    console.log(obj);
}

function logln() {
    for (let i = 0; i < arguments.length; i++) {
        console.log(arguments[i]);
    }
}

function rmf(element) {
    if (element) {
        element.remove();
    }
}

function getWeek(date = new Date(), prefix = '星期') {
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

function listenTime(date = {}, week = {}, time = {}) {
    setInterval(() => {
        date.innerText = getDate();
        week.innerText = getWeek();
        time.innerText = getTime();
    }, 1);
}

function getDate() {
    let date = new Date();
    return `${ date.getFullYear() }-${ date.getMonth() + 1 }-${ date.getDate() }`;
}

function getTime() {
    let date = new Date();
    return `${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() }, ${ date.getMilliseconds() }`
}

Date.prototype.clone = function() {
    return new Date(this.valueOf());
}

Date.prototype.equalYear = function(that) {
    return this.getFullYear() == that.getFullYear();
}

Date.prototype.equalMonth = function(that) {
    return this.getFullYear() == that.getFullYear() && (this.getMonth() + 1) == (that.getMonth() + 1);
}

Date.prototype.equalWeek = function(that) {
    let _this = this.clone();
    let _that = that.clone();
    _this.setDate(_this.getDate() - _this.getDay()); // 计算出周日
    _that.setDate(_that.getDate() - _that.getDay()); // 计算出周日
    return _this.equalDate(_that);
}

Date.prototype.equalDate = function(that) {
    return this.getFullYear() == that.getFullYear() && (this.getMonth() + 1) == (that.getMonth() + 1) && this.getDate() == that.getDate();
}

/** callback: 传入数组中的一个元素, 返回 key */
function groupBy(list = [], prop, callback = null) {
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
function generateSelect(id, list = [], config = {}) {
    let callback = config.callback || '';
    let defaultValue = config.defaultValue || '请选择';
    let className = config.className || '';
    return `<div class="dinglj-select-container ${ className }" id="${ id }-select-container">
        <div class="select-value" id="${ id }-select-value">${ defaultValue }</div>
        <div class="select-items" id="${ id }-select-items">
            ${ list.map(val => `<div class="select-item" id="${ id }-select-${ val }" onclick="onSelectionClicked('${ callback }', '${ id }-select-${ val }')">${ val }</div>`).join('') }
        </div>
    </div>`;
}

/** 选择控件的选项被点击时调用 */
function onSelectionClicked(callback, id) {
    let click = getById(id);
    let val = click.parentNode.previousElementSibling;
    val.innerText = click.innerText.trim();
    if (callback.trim()) {
        eval(`${ callback }('${ val.innerText }')`);
    }
}

/** 获取选择控件的值 */
function getSelectValue(id) {
    return getById(`${ id }-select-container`).children[0].innerText
}
