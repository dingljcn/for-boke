const context_001 = {
    imageList: [],
    steps: {},
    layout: ['line', 'step', 'history', 'star'],
    persist: {
        history: [],
        star: [],
    },
    drag: {
        active: false,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
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
    bindDragEvent_001();
    displayScroll_001();
}

/** 绘制布局 */
function initLayout_001() {
    newElement('style', {
        parentNode: document.head
    }, {
        innerText: context_001.config.style.css
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
                    <div id="dinglj-steps">
                        <div id="dinglj-steps-view"></div>
                        <div id="dinglj-steps-scroll">
                            <div class="scroll-block"></div>
                        </div>
                    </div>
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
    getById('dinglj-steps-view').innerHTML = context_001.steps[lineNumber]
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
    // 已经存在, 不再添加
    if (context_001.persist.history.includes(key)) {
        return;
    }
    // 添加
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
    // 持久化
    savePersist_001();
    // 绑定点击事件
    tmp.addEventListener('click', e => {
        toHistory_001(tmp, e);
    });
}

/** 切换 tab 页事件 */
function changeTab_001(to = 'history') {
    let container = getById('dinglj-his-star-mask');
    let left = container.style.left || '0px';
    if (to == 'history' && parseInt(left) < 0) {
        moveTab_001(container, `-${ context_001.config.style.css_const.nav.width }`, '0px', 100, () => {
            getById('dinglj-history-title').classList.add('active-tab');
            getById('dinglj-star-title').classList.remove('active-tab');
        });
    } else if (to == 'star' && parseInt(left) > -200) {
        moveTab_001(container, '0px', `-${ context_001.config.style.css_const.nav.width }`, 100, () => {
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

/** 切换历史记录事件 */
function toHistory_001(element, e) {
    toItem_001(context_001.focus, 'history', element);
    context_001.focus = 'history';
    let data = /\[(\d+)] - (.*)/.exec(element.innerText);
    let key = `1/${ data[1] }/${ data[2] }`;
    getById('dinglj-image').src = key;
}

/** 添加到重点关注 */
function addToStar_001() {
    let data = getImgData();
    addToStarList_001(data.lineNumber, data.step);
}

/** 添加到重点关注列表 */
function addToStarList_001(lineNumber, step) {
    const key = `${ lineNumber }/${ step }`;
    // 已存在, 不添加
    if (context_001.persist.star.includes(key)) {
        return;
    }
    // 添加
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
    // 持久化
    savePersist_001();
    // 绑定点击事件
    tmp.addEventListener('click', e => {
        toStar_001(tmp, e);
    });
}

/** img 标签得 src 从地址转为 lineNumber, step */
function getImgData() {
    let text = decodeURI(getById('dinglj-image').src);
    let url = decodeURI(window.location.href);
    text = text.replace(url, '');
    return pathTolineNumberAndStep(text);
}

/** 1/行号/步骤.png 转为 lineNumber, step */
function pathTolineNumberAndStep(text) {
    let data = /1\/(\d+)\/(.*)/.exec(text);
    return {
        lineNumber: data[1],
        step: data[2]
    }
}

/** 切换到重点关注事件 */
function toStar_001(element, e) {
    toItem_001(context_001.focus, 'star', element);
    context_001.focus = 'star';
    let data = /\[(\d+)] - (.*)/.exec(element.innerText);
    let key = `1/${ data[1] }/${ data[2] }`;
    getById('dinglj-image').src = key;
}

/** 清除历史记录点击事件 */
function cleanHistory_001() {
    let data = getImgData();
    context_001.persist.history = [];
    getById('dinglj-history-list').innerHTML = '';
    // 当前正在浏览的图片重新添加
    addToHistory_001(data.lineNumber, data.step);
    // 持久化
    savePersist_001();
}

/** 清除重点关注点击事件 */
function cleanStar_001() {
    context_001.persist.star = [];
    getById('dinglj-star-list').innerHTML = '';
    // 持久化
    savePersist_001();
}

/** 持久化历史记录与重点关注 */
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

/** 恢复历史记录与重点关注 */
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

/** 读取持久化数据 */
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

function displayScroll_001() {
    moveScroll_001('dinglj-lines-view', 'line-item', 'dinglj-lines-scroll');
    moveScroll_001('dinglj-steps-view', 'line-item', 'dinglj-steps-scroll');
    moveScroll_001('dinglj-histories-view', 'line-item', 'dinglj-histories-scroll');
    moveScroll_001('dinglj-stars-view', 'line-item', 'dinglj-stars-scroll');
}

/** 滚动条显示逻辑 */
function moveScroll_001(containerID, itemClass, scrollID) {
    /** 容器, Element */
    let container = getById(containerID);
    if (!container) {
        return;
    }
    /** 有效元素, Element */
    let item = getValidItem_001(itemClass);
    if (!item) {
        return;
    }
    /** 滚动条, Element */
    let scroll = getById(scrollID);
    /** 滚动块, Element */
    let scrollBtn = scroll.children[0];
    /** 视图高度, Number */
    let viewHeight = container.offsetHeight;
    /** 有效元素的下标, Int */
    let idx = calcIndex_001(itemClass, item);
    /** 有效元素的整体高度, Int */
    let itemHeight = item.offsetHeight + 3;
    /** 元素的总个数, Int */
    let totalCount = container.children.length;
    /** 所有元素整体高度的和, Int */
    let totalHeight = itemHeight * totalCount;
    // 如果整体高度之和 < 视图高度, 表示没有必要用滚动条, 则将其隐藏
    scroll.style.opacity = 1;
    if (totalHeight < viewHeight) {
        scroll.style.opacity = 0;
        return
    }
    /** 视图高度的一半所能显示的元素个数, Int */
    let halfViewSize = parseInt(viewHeight / 2 / itemHeight);
    /** 视图高度的一半, Int */
    let baseHeight = halfViewSize * itemHeight;
    /** 当前元素的绝对偏移量, Int */
    let offset4Item = itemHeight * idx;
    /** 滚动条高度 = (视图高度 / 整体高度之和) * 视图高度, Int */
    let scrollBtnHeight = (viewHeight / totalHeight) * viewHeight;
    /** 距离顶部的偏移量, Int */
    let scrollBtnTop = 0;
    // 设置滚动块高度
    scrollBtn.style.height = `${ scrollBtnHeight }px`;
    // 当前元素绝对偏移量已经超过了视图一半的高度, 则进行滚动
    if (offset4Item > halfViewSize) {
        /** 滚动比例, 减去无需滚动的部分, Double */
        let scrollPercent = (idx - halfViewSize) / (totalCount - halfViewSize);
        /** 离顶部的相对偏移量 */
        let relativeTop = offset4Item - baseHeight;
        // 设置当前元素偏移量, 不能小于 0
        container.style.top = `-${ relativeTop < 0 ? 0 : relativeTop }px`;
        // 滚动高度, 先用滚动条高度减去滚动块自己的高度, 再乘上百分比
        scrollBtnTop = scrollPercent * (viewHeight - scrollBtnHeight);
    }
    // 滚动条进行滚动
    scrollBtn.style.top = `${ scrollBtnTop < 0 ? 0 : scrollBtnTop }`;
}

/** 获取当前作用域中有效的元素, 优先级依次为 active, last, first */
function getValidItem_001(itemClass) {
    if (!itemClass) {
        return null;
    }
    let item = getByClass(`${ itemClass } active`)[0]; //先取 active
    if (!item) {
        item = getByClass(`${ itemClass } last`)[0]; // 再取 last
        if (!item) {
            item = getByClass(`${ itemClass }`)[0]; // 最后取第一个
        }
    }
    return item;
}

/** 计算期望的元素在列表中排第几个 */
function calcIndex_001(itemClass, expectItem) {
    let list = getByClass(itemClass);
    for (idx = 0; idx < list.length; idx++) { // 定位当前元素下标
        if (list[idx].id == expectItem.id) {
            return idx;
        }
    }
}

/** 绑定拖拽事件 */
function bindDragEvent_001() {
    startDrag_001();
    finishDrag_001();
    doDrag_001();
}

/** 拖拽开始实现 */
function startDragImpl_001(element, e) {
    // 记录起始 x, y 坐标, 记录原来的 top, left 值
    context_001.drag.active = true;
    context_001.drag.x = e.screenX;
    context_001.drag.y = e.screenY;
    context_001.drag.top = parseInt(element.style.top || '0');
    context_001.drag.left = parseInt(element.style.left || '0');
    context_001.drag.element = element;
}

/** 拖拽开始事件 */
function startDrag_001() {
    let list = getByClass('scroll-block');
    for (let i = 0; i < list.length; i++) {
        let element = list[i];
        element.addEventListener('mousedown', e => {
            logln('点击的元素:', element, '事件', e);
            startDragImpl_001(element, e);
        });
        logln("元素", element, "代码", element.mousedown);
    }
}

/** 拖拽结束实现 */
function finishDragImpl_001(element, e) {
    context_001.drag.active = false;
}

/** 拖拽结束事件 */
function finishDrag_001() {
    window.addEventListener('mouseup', e => {
        finishDragImpl_001(context_001.drag.element, e);
    });
}

/** 拖拽过程实现 */
function doDragImpl_001(element, e) {
    if (context_001.drag.active) {
        // 鼠标偏移量
        let offset = e.screenY - context_001.drag.y;
        // 新的 top = 以前的 top + 偏移量
        let target = context_001.drag.top + offset;
        // 偏移量最小为 0, 最大为滚动条高度 - 滚动块高度
        let min = 0, max = element.parentElement.offsetHeight - element.offsetHeight;
        if (target < min) {
            target = min;
        } else if (target > max) {
            target = max;
        }
        element.style.top = `${ target }px`;
        onDragScroll_001(element);
    }
}

/** 拖拽过程事件 */
function doDrag_001() {
    window.addEventListener('mousemove', e => {
        doDragImpl_001(context_001.drag.element, e);
    });
}

/** 拖拽滚动块事件 */
function onDragScroll_001(element) {
    /** 滚动条 */
    let parent = element.parentElement;
    /** 元素列表 */
    let view = parent.previousElementSibling;
    if (!view.children) {
        return;
    }
    /** 最大高度 */
    let max = parent.offsetHeight - element.offsetHeight;
    /** 顶部偏移量 */
    let toTop = parseInt(element.style.top);
    /** 偏移比例 */
    let percent = toTop / max;
    /** 任意元素 */
    let item = view.children[0];
    /** 元素的高度 */
    let itemHeight = item.offsetHeight + 3;
    /** 视图一半的高度所能显示的元素个数 */
    let halfViewSize = parseInt(view.offsetHeight / 2 / itemHeight);
    /** 参与滚动的元素个数, 即视图一半以前的不参与滚动 */
    let scrollItemSize = view.children.length - halfViewSize;
    /** 要显示的元素下标 = 参与滚动的元素个数 * 百分比 */
    let idx = parseInt(scrollItemSize * percent);
    /** 距离顶部的绝对偏移量 */
    let offset4Item = itemHeight * idx;
    if (offset4Item > halfViewSize * itemHeight) {
        // 滚动元素列表
        view.style.top = `${ offset4Item - (itemHeight * halfViewSize) }px`;
    }
}