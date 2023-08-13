const context_001 = {
    imageList: [],
    steps: {},
    layout: ['line', 'step', 'history', 'star'],
    persist: {
        history: [],
        star: [],
    }
};

function onload_001(callback) {
    // 引入通用脚本
    let utilScript = document.createElement('script');
    utilScript.type = 'text/javascript';
    utilScript.src = 'https://dingljcn.github.io/for-boke/beta/utils.js?' + Math.random();
    // 成功
    utilScript.onload = async function() {
        localStorage.setItem(`dinglj-script-001`, utilScript.src); // 缓存本次成功 load 的 url
        callback();
    }
    // 失败
    utilScript.onerror = () => {
        let lastURL = localStorage.getItem(`dinglj-script-001`);
        console.error(`${ utilScript.src } 拉取失败, 拉取上次成功的地址 ${ lastURL }`);
        utilScript.remove();
        appendScript(callback);
    }
    document.head.appendChild(utilScript);
}

function run_001(config) {
    // 检验配置
    context_001.config = config;
    logln('传入的配置: ', context_001.config);
    if (!isMatch(context_001.config)) {
        console.error('不符合以下地址匹配规则');
        console.error(context_001.config.matchList);
        return;
    }
    // 正式开始独立的逻辑
    exec_001();
}

/** 正式执行逻辑 */
function exec_001() {
    initLayout_001();
    restorePersist_001();
    drawLineNumber_001();
    bindKeyboardEvent_001();
    moveScroll_001('dinglj-lines-view', 'line-item', 'dinglj-lines-scroll');
}


const css_const = {
    title: {
        background: '#321b33',
        height: '40px'
    },
    image: {
        padding: '20px',
    },
    nav: {
        width: '250px',
    }
}

const css_001 = `body {
    margin: 0;
    font-size: 14px;
}
#dinglj-all-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}
#dinglj-all-title {
    background: ${ css_const.title.background };
    height: ${ css_const.title.height };
    line-height: ${ css_const.title.height };
    display: flex;
    color: white;
}
#dinglj-under-title {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
}
#dinglj-web-name {
    padding: 0 10px;
}
#dinglj-center-title {
    display: flex;
    flex: 1;
    padding: 0 10px;
}
.dinglj-step-counter {
    padding: 0 10px;
}
#dinglj-line-input,
#dinglj-step-input {
    outline: none;
    width: 3rem;
}
#dinglj-other-options {
    padding: 0 10px;
}
#dinglj-left-guide {
    width: ${ css_const.nav.width };
    height: 100%;
    overflow: hidden;
    display: flex;
}
#dinglj-line-container {
    width: 80px;
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    text-align: center;
}
#dinglj-line-title {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-lines {
    padding: 6px;
    flex: 1;
    overflow: hidden;
    display: flex;
}
#dinglj-lines-view {
    flex: 1;
    position: relative;
    transition: 0.2;
}
#dinglj-lines-scroll {
    width: 4px;
    background: #CCC;
    height: 100%;
    margin-left: 6px;
}
.scroll-block {
    position: relative;
    width: 6px;
    margin-left: -1px;
    background: white;
    box-shadow: 0 0 5px grey;
    border-radius: 3px;
    transition: 0.2s;
}
#dinglj-step-container {
    flex: 1;
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
}
#dinglj-step-title {
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-steps {
    padding: 6px;
    flex: 1;
    overflow-y: scroll;
}
#dinglj-image-area {
    flex: 1;
    overflow: hidden;
}
#dinglj-image-box {
    width: calc(100% - ${ css_const.image.padding } * 2);
    height: calc(100% - ${ css_const.image.padding } * 2);
    padding: ${ css_const.image.padding };
}
#dinglj-image {
    border-radius: 5px;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    box-shadow: 0 0 10px 1px grey;
}
#dinglj-right-guide {
    width: ${ css_const.nav.width };
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
#dinglj-right-title {
    height: 30px;
    line-height: 30px;
    display: flex;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-history-title,
#dinglj-star-title {
    padding: 0 5px;
    cursor: pointer;
}
#dinglj-his-star-list {
    flex: 1;
    overflow: hidden;
}
#dinglj-his-star-mask {
    width: calc(${ css_const.nav.width } * 2);
    position: relative;
    height: 100%;
    display: flex;
}
#dinglj-history-list {
    width: ${ css_const.nav.width };
    overflow-y: scroll;
}
#dinglj-star-list {
    width: ${ css_const.nav.width };
    overflow-y: scroll;
}
.dinglj-item {
    padding: 3px;
    margin: 3px 0;
    cursor: pointer;
}
.active {
    background: blue;
    color: white;
    border-radius: 5px;
    font-weight: bolder;
}
.last {
    background: #DDD;
    border-radius: 5px;
}
.active-tab {
    color: blue;
    font-weight: bolder;
}
.toolbar-item {
    cursor: pointer;
    padding: 0 15px;
}
#dinglj-toolbar-box {
    display: flex;
}
`;

/** 绘制布局 */
function initLayout_001() {
    newElement('style', {
        parentNode: document.head
    }, {
        innerText: css_001
    }, []);
    document.body.innerHTML = `<div id="dinglj-all-container">
        <div id="dinglj-all-title">
            <div id="dinglj-web-name">用例截图查看工具</div>
            <div id="dinglj-center-title">
                <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                <div id="dinglj-toolbar-box">
                    <div class="toolbar-item" onclick="addToStar_001()">标记为重点关注图片</div>
                    <div class="toolbar-item" onclick="cleanHistory_001()">清空历史记录</div>
                    <div class="toolbar-item" onclick="cleanStar_001()">清空重点关注</div>
                </div>
                <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                <div class="dinglj-step-counter">
                    <span>行数：</span>
                    <input id="dinglj-line-input"/> / <span id="dinglj-line-total"></span>
                </div>
                <div class="dinglj-step-counter">
                    <span>步数：</span>
                    <input id="dinglj-step-input"/> / <span id="dinglj-step-total"></span>
                </div>
                <div style="flex: 1; opacity: 0">弹性布局填充物</div>
            </div>
            <div id="dinglj-other-options">其他操作</div>
        </div>
        <div id="dinglj-under-title">
            <div id="dinglj-left-guide">
                <div id="dinglj-line-container">
                    <div id="dinglj-line-title">行数</div>
                    <div id="dinglj-lines">
                        <div id="dinglj-lines-view"></div>
                        <div id="dinglj-lines-scroll">
                            <div class="scroll-block"></div>
                        </div>
                    </div>
                </div>
                <div id="dinglj-step-container">
                    <div id="dinglj-step-title">步数</div>
                    <div id="dinglj-steps"></div>
                </div>
            </div>
            <div id="dinglj-image-area">
                <div id="dinglj-image-box">
                    <img id="dinglj-image" src="1/11/4_录入.png"/>
                </div>
            </div>
            <div id="dinglj-right-guide">
                <div id="dinglj-right-title">
                    <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                    <div id="dinglj-history-title" class="active-tab" onclick="changeTab_001('history')">历史记录</div>
                    <div id="dinglj-star-title" onclick="changeTab_001('star')">重点关注</div>
                    <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                </div>
                <div id="dinglj-his-star-list">
                    <div id="dinglj-his-star-mask">
                        <div id="dinglj-history-list"></div>
                        <div id="dinglj-star-list"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

/** 绘制行号 */
function drawLineNumber_001() {
    let res = get('1');
    let reg = /.*<a href="([0-9]+\/)".*/;
    context_001.lineNumbers = res.split('\n')
        .map(line =>  reg.test(line) ? reg.exec(line)[1] : '')
        .filter(href => href != '')
        .map(href => href.substring(0, href.length - 1));
    getById('dinglj-lines-view').innerHTML = context_001.lineNumbers
        .map(number => `<div class="line-item dinglj-item" id="line-${ number }">${ number }</div>`)
        .join('');
    bindLineEvent_001();
    // 更新总行数
    getById('dinglj-line-total').innerText = context_001.lineNumbers[context_001.lineNumbers.length - 1];
    let lines = getByClass('line-item');
    if (lines && lines.length > 0) {
        lines[0].click();
    }
}

/** 界面点击行号事件 */
function bindLineEvent_001() {
    let list = getByClass('line-item');
    for (let element of list) {
        element.addEventListener('click', e => {
            e.stopPropagation();
            log(`点击第${ element.innerText }行`);
            toLine_001(context_001.focus, 'line', element);
            context_001.focus = 'line';
        })
    }
}

/** 切换行事件 */
function toLine_001(oldScope, newScope, element, order = 'head', callback = () => {}) {
    toItem_001(oldScope, newScope, element, callback);
    drawSteps(element);
    getById('dinglj-line-input').value = element.innerText;
    let steps = getByClass('step-item');
    if (steps && steps.length > 0) {
        let step;
        if (order == 'head') {
            step = steps[0];
        } else {
            step = steps[steps.length - 1];
        }
        toStep_001(context_001.focus, 'step', step, false);
        step.classList.add('last');
        return step;
    }
}

/** 切换条目事件 */
function toItem_001(oldScope, newScope, element, callback) {
    let activeElements = getByClass(`active ${ oldScope }-item`);
    if (activeElements.length == 1) { // 一致, 不用切换样式
        if (element.id == activeElements[0].id) {
            return;
        }
    }
    // 把旧作用域的 last 清除
    let lastElements = getByClass(`last ${ oldScope }-item`);
    for (let lastElement of lastElements) {
        lastElement.classList.remove('last');
    }
    // 把旧作用域的 active 标记为 last
    for (let activeElement of activeElements) {
        activeElement.classList.remove('active');
        activeElement.classList.add('last');
    }
    // 把当前元素标记为 active, 并移除 last
    element.classList.remove('last');
    element.classList.add('active');
    moveScroll_001(`dinglj-${ newScope }s-view`, `${ newScope }-item`, `dinglj-${ newScope }s-scroll`)
}

/** 绘制步骤 */
function drawSteps(element) {
    const lineNumber = element.innerText;
    let reg = /.*\.png">(.*.png)<\/a>.*/;
    let res = get(`1/${ lineNumber }`);
    context_001.steps[lineNumber] = res.split('\n')
            .map(line =>  reg.test(line) ? reg.exec(line)[1] : '')
            .filter(href => href != '');
    getById('dinglj-steps').innerHTML = context_001.steps[lineNumber]
        .map(n => `<div class="step-item dinglj-item" id="step-${n}">${n}</div>`)
        .join('');
    bindStepEvent_001();
    getById('dinglj-step-total').innerText = Object.keys(context_001.steps).length;
}

/** 界面点击步骤事件 */
function bindStepEvent_001() {
    let list = getByClass('step-item');
    for (let element of list) {
        element.addEventListener('click', e => {
            e.stopPropagation();
            log(`点击图片${ element.innerText }`);
            toStep_001(context_001.focus, 'step', element);
            context_001.focus = 'step';
        });
    }
}

/** 切换步骤事件 */
function toStep_001(oldScope, newScope, element, fromClick = true) {
    if (fromClick) {
        toItem_001(oldScope, newScope, element);
    }
    getById('dinglj-step-input').value = parseInt(element.innerText);
    const lineNumber = getById('dinglj-line-input').value;
    getById('dinglj-image').src = `1/${ lineNumber }/${ element.innerText }`;
    addToHistory_001(lineNumber, element.innerText);
}

/** 添加到历史记录 */
function addToHistory_001(lineNumber, step) {
    const key = `${ lineNumber }/${ step }`;
    if (context_001.persist.history.includes(key)) {
        return;
    }
    context_001.persist.history.push(key);
    let container = getById('dinglj-history-list');
    let tmp = newElement('div', {
        parentNode: container,
    }, {
        id: `history-item-${ container.children.length }`,
        innerText: `[${ lineNumber }] - ${ step }`,
    });
    tmp.classList.add('dinglj-item');
    tmp.classList.add('history-item');
    savePersist_001();
    tmp.addEventListener('click', e => {
        toHistory_001(tmp, e);
    });
}

/** 切换 tab 页事件 */
function changeTab_001(to = 'history') {
    let container = getById('dinglj-his-star-mask');
    let left = container.style.left || '0px';
    if (to == 'history' && parseInt(left) < 0) {
        moveTab_001(container, `-${ css_const.nav.width }`, '0px', 100, () => {
            getById('dinglj-history-title').classList.add('active-tab');
            getById('dinglj-star-title').classList.remove('active-tab');
        });
    } else if (to == 'star' && parseInt(left) > -200) {
        moveTab_001(container, '0px', `-${ css_const.nav.width }`, 100, () => {
            getById('dinglj-history-title').classList.remove('active-tab');
            getById('dinglj-star-title').classList.add('active-tab');
        });
    }
}

/** tab 页切换动画 */
function moveTab_001(element, from, to, mills = 200, callback = () => {}) {
    let step = (parseInt(to) - parseInt(from)) / mills;
    let timer = setInterval(() => {
        let left = parseInt(element.style.left || '0px');
        if ((step > 0 && left > parseInt(to)) || (step < 0 && left < parseInt(to))) {
            clearInterval(timer);
            element.style.left = to;
            return;
        }
        element.style.left = `${ left + step }px`;
        callback();
    }, 1);
}

/** 键盘事件绑定 */
function bindKeyboardEvent_001() {
    changeScope_001(context_001.layout, false, null);
    window.addEventListener('keyup', e => {
        onKeyUp_001(e);
    });
}
/** 按键抬起事件 */
function onKeyUp_001(e) {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        changeItem_001(e.key == 'ArrowUp', e);
    } else if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        changeScope_001(context_001.layout, e.key == 'ArrowLeft', e);
    }
}

/** 上下切换事件 */
function changeItem_001(isPrev, e) {
    let element = getByClass('active')[0];
    let prevStep = element.previousElementSibling;
    let nextStep = element.nextElementSibling;
    if (context_001.focus == 'step') {
        if (isPrev) { // 向前翻
            if (prevStep) { // 前一个步骤存在, 直接切换
                prevStep.click();
            } else { // 不存在, 跳转到前一行的最后一个步骤
                let lastLine = getByClass('line-item last')[0];
                if (lastLine.previousElementSibling) {
                    let step = toLine_001('step', 'line', lastLine.previousElementSibling, 'tail');
                    if (step) { // 焦点重新回到 step
                        toItem_001('line', 'step', step);
                    }
                }
            }
        } else { // 向后翻
            if (nextStep) { // 后一个步骤存在, 直接切换
                nextStep.click();
            } else { // 不存在, 则跳转后一行的第一个步骤
                let lastLine = getByClass('line-item last')[0];
                if (lastLine.nextElementSibling) {
                    let step = toLine_001('step', 'line', lastLine.nextElementSibling, 'head');
                    if (step) { // 焦点重新回到 step
                        toItem_001('line', 'step', step);
                    }
                }
            }
        }
    } else { //if (context_001.focus == 'line') {
        if (isPrev) {
            if (prevStep) {
                prevStep.click();
            }
        } else {
            if (nextStep) {
                nextStep.click();
            }
        }
    }
}

/** 左右切换事件 */
function changeScope_001(layout, isLeft, e) {
    let idx = layout.indexOf(context_001.focus);
    let len = layout.length;
    let direction = isLeft ? -1 : 1;
    // 计算下一个作用域
    let nextScope = layout[((len + idx + direction) % len)];
    // 获取下一个作用域的 last
    let nextElements = getByClass(`${ nextScope }-item last`);
    let nextElement = null;
    // 如果 last 存在, 则取 last
    if (nextElements && nextElements.length == 1) {
        nextElement = nextElements[0];
    } else {
        // 如果 last 不存在, 则取第一个
        nextElements = getByClass(`${ nextScope }-item`);
        if (nextElements && nextElements.length > 0) {
            nextElement = nextElements[0];
        }
    }
    // 如果下一个存在元素, 则切换作用域
    if (nextElement) {
        toItem_001(context_001.focus, nextScope, nextElement);
        context_001.focus = nextScope;
        if (nextScope == 'history') {
            changeTab_001('history');
        } else if (nextScope == 'star') {
            changeTab_001('star');
        }
    } else { // 否则移除 nextScope, 再次计算
        let tmpLayout = JSON.parse(JSON.stringify(layout));
        let idx = tmpLayout.indexOf(nextScope);
        tmpLayout.splice(idx, 1)
        changeScope_001(tmpLayout, isLeft, e);
    }
}

function toHistory_001(element, e) {
    toItem_001(context_001.focus, 'history', element);
    context_001.focus = 'history';
    let data = /\[(\d+)] - (.*)/.exec(element.innerText);
    let key = `1/${ data[1] }/${ data[2] }`;
    getById('dinglj-image').src = key;
}

function addToStar_001() {
    let data = getImgData();
    addToStarList_001(data.lineNumber, data.step);
}

function addToStarList_001(lineNumber, step) {
    const key = `${ lineNumber }/${ step }`;
    if (context_001.persist.star.includes(key)) {
        return;
    }
    context_001.persist.star.push(key);
    let container = getById('dinglj-star-list');
    let tmp = newElement('div', {
        parentNode: container,
    }, {
        id: `star-item-${ container.children.length }`,
        innerText: `[${ lineNumber }] - ${ step }`,
    });
    tmp.classList.add('dinglj-item');
    tmp.classList.add('star-item');
    savePersist_001();
    tmp.addEventListener('click', e => {
        toStar_001(tmp, e);
    });
}

function getImgData() {
    let text = decodeURI(getById('dinglj-image').src);
    let url = decodeURI(window.location.href);
    text = text.replace(url, '');
    return pathTolineNumberAndStep(text);
}

function pathTolineNumberAndStep(text) {
    let data = /1\/(\d+)\/(.*)/.exec(text);
    return {
        lineNumber: data[1],
        step: data[2]
    }
}

function toStar_001(element, e) {
    toItem_001(context_001.focus, 'star', element);
    context_001.focus = 'star';
    let data = /\[(\d+)] - (.*)/.exec(element.innerText);
    let key = `1/${ data[1] }/${ data[2] }`;
    getById('dinglj-image').src = key;
}

function cleanHistory_001() {
    let data = getImgData();
    context_001.persist.history = [];
    getById('dinglj-history-list').innerHTML = '';
    addToHistory_001(data.lineNumber, data.step);
    savePersist_001();
}

function cleanStar_001() {
    context_001.persist.star = [];
    getById('dinglj-star-list').innerHTML = '';
    savePersist_001();
}

function savePersist_001() {
    if (context_001.config.persist) {
        let str = localStorage.getItem('dinglj-001-cache');
        let json = {};
        if (str) {
            json = JSON.parse(str);
        }
        json[window.location.href] = context_001.persist;
        localStorage.setItem('dinglj-001-cache', JSON.stringify(json));
    }
}

function restorePersist_001() {
    let data = readPersist_001();
    if (data) {
        if (data.history) {
            for (let tmp of data.history) {
                let kv = tmp.split('/');
                addToHistory_001(kv[0], kv[1]);
            }
        }
        if (data.star) {
            for (let tmp of data.star) {
                let kv = tmp.split('/');
                addToStarList_001(kv[0], kv[1]);
            }
        }
    }
}

function readPersist_001() {
    if (context_001.config.persist) {
        let str = localStorage.getItem('dinglj-001-cache');
        let json = {};
        if (str) {
            json = JSON.parse(str);
        }
        return json[window.location.href] || null;
    }
    return null;
}

function moveScroll_001(containerID, itemClass, scrollID) {
    let container = getById(containerID); // 容器
    if (!container) {
        return;
    }
    let scroll = getById(scrollID); // 滚动条
    let scrollBtn = scroll.children[0]; // 滚动块
    let viewHeight = container.offsetHeight;
    let item = getByClass(`${ itemClass } active`)[0]; //先取 active
    if (!item) {
        item = getByClass(`${ itemClass } last`)[0]; // 再取 last
        if (!item) {
            item = getByClass(`${ itemClass }`)[0]; // 最后取第一个
            if (!item) {
                return; //不存在, 退出
            }
        }
    }
    let i = -1;
    let list = getByClass(itemClass);
    for (i = 0; i < list.length; i++) { // 定位当前元素下标
        if (list[i].id == item.id) {
            break;
        }
    }
    let itemHeight = item.offsetHeight + 3; // 元素全高度
    let itemSize = container.children.length; // 元素个数
    let totalHeight = itemHeight * itemSize; // 滚动高度
    let offset4Item = itemHeight * i;
    let scrollBtnHeight = (viewHeight / totalHeight) * viewHeight; // 滚动高度要减去滚动条本身的高度
    scrollBtn.style.height = `${ scrollBtnHeight }px`; // 设置滚动块高度
    if (offset4Item < viewHeight / 2) {
        // 偏移量小于显示高度的一一半, 什么都不做
    } else {
        scrollBtn.style.top = `${ (i / itemSize) * (viewHeight - scrollBtnHeight) }`;
        let baseHeight = parseInt(viewHeight / 2 / 31) * 31; // 视图一半的高度
        container.style.top = `-${ offset4Item - baseHeight }px`; // 设置当前元素偏移量
        console.log(container.style.top);
    }
}
