const context_001 = {
    imageList: [],
    steps: {},
    layout: ['line', 'step', 'his', 'star'],
    presist: {
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

function exec_001() {
    initLayout_001();
    drawLineNumber_001();
}


const css_const = {
    title: {
        background: '#321b33',
        height: '40px'
    },
    image: {
        padding: '20px',
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
    width: 200px;
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
    height: 20px;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-lines {
    padding: 6px;
    flex: 1;
    overflow-y: scroll;
}
#dinglj-lines::webkit-scrollbar {
    width: 5px;
}
#dinglj-step-container {
    flex: 1;
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
}
#dinglj-step-title {
    height: 20px;
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
    width: 200px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
#dinglj-right-title {
    height: 20px;
    display: flex;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-history-title {
    padding: 0 5px;
}
#dinglj-star-title {
    padding: 0 5px;
}
#dinglj-his-star-list {
    flex: 1;
    overflow: hidden;
}
#dinglj-his-star-mask {
    width: 400px;
    position: relative;
    height: 100%;
    display: flex;
}
#dinglj-history-list {
    width: 200px;
    overflow-y: scroll;
}
#dinglj-star-list {
    width: 200px;
    overflow-y: scroll;
}
.dinglj-item {
    padding: 3px;
    margin: 3px 0;
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
`;


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
                    <div id="dinglj-lines"></div>
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
                    <div id="dinglj-history-title" onclick="changeTab_001('history')">历史记录</div>
                    <div id="dinglj-history-star" onclick="changeTab_001('star')">重点关注</div>
                    <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                </div>
                <div id="dinglj-his-star-list">
                    <div id="dinglj-his-star-mask">
                        <div id="dinglj-history-list"></div>
                        <div id="dinglj-star-list">
                            <div class="star-item dinglj-item" id="star-item-1">1_查看.png</div>
                            <div class="star-item dinglj-item" id="star-item-2">2_查看.png</div>
                            <div class="star-item dinglj-item" id="star-item-3">3_查看.png</div>
                            <div class="star-item dinglj-item" id="star-item-4">4_查看.png</div>
                            <div class="star-item dinglj-item" id="star-item-5">5_查看.png</div>
                        </div>
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
    getById('dinglj-lines').innerHTML = context_001.lineNumbers
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
        toStep_001(context_001.focus, 'step', steps[0], false);
        step.classList.add('last');
    }
}

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
}

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

function toStep_001(oldScope, newScope, element, fromClick = true) {
    if (fromClick) {
        toItem_001(oldScope, newScope, element);
    }
    getById('dinglj-step-input').value = parseInt(element.innerText);
    const lineNumber = getById('dinglj-line-input').value;
    getById('dinglj-image').src = `1/${ lineNumber }/${ element.innerText }`;
    addToHistory_001(lineNumber, element.innerText);
}

function addToHistory_001(lineNumber, step) {
    const key = `${ lineNumber }/${ step }`;
    if (context_001.presist.history.includes(key)) {
        return;
    }
    context_001.presist.history.push(key);
    let container = getById('dinglj-history-list');
    let tmp = newElement('div', {
        parentNode: container,
    }, {
        id: `history-item-${ container.children.length }`,
        innerText: `[${ lineNumber }] - ${ step }`,
    });
    tmp.classList.add('dinglj-item');
    tmp.classList.add('history-item');
}

function changeTab_001(to = 'history') {
    let container = getById('dinglj-his-star-mask');
    let left = container.style.left || '0px';
    if (to == 'history' && parseInt(left) < 0) {
        moveTab_001(container, '-200px', '0px', 100, () => {
            getById('dinglj-history-title').classList.add('active-tab');
            getById('dinglj-star-title').classList.remove('active-tab');
        });
    } else if (to == 'star' && parseInt(left) > -200) {
        moveTab_001(container, '0px', '-200px', 100, () => {
            getById('dinglj-history-title').classList.remove('active-tab');
            getById('dinglj-star-title').classList.add('active-tab');
        });
    }
}

function moveTab_001(element, from, to, mills = 200, callback = () => {}) {
    let step = (parseInt(to) - parseInt(from)) / mills;
    let timer = setInterval(() => {
        let left = parseInt(element.style.left || '0px');
        console.log(left);
        if ((step > 0 && left > parseInt(to)) || (step < 0 && left < parseInt(to))) {
            clearInterval(timer);
            element.style.left = to;
            return;
        }
        element.style.left = `${ left + step }px`;
    }, 1);
}