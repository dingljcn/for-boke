const context_001 = {
    imageList: [],
    focus: 'step', // line, step, his, star
    layout: ['line', 'step', 'his', 'star'],
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
    flex: 1;
    padding: 0 10px;
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
#dinglj-history-list {
    width: 200px;
    overflow-y: scroll;
}
#dinglj-history-list {
    width: 200px;
    overflow-y: scroll;
}
.dinglj-item {
    padding: 3px 0;
}
.active {
    background: blue;
    color: white;
    border-radius: 5px;
    font-weight: bolder;
}`;


function initLayout_001() {
    newElement('style', {
        parentNode: document.head
    }, {
        innerText: css_001
    }, []);
    document.body.innerHTML = `<div id="dinglj-all-container">
        <div id="dinglj-all-title">
            <div id="dinglj-web-name">用例截图查看工具</div>
            <div id="dinglj-center-title"></div>
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
                    <div id="dinglj-history-title">历史记录</div>
                    <div id="dinglj-history-star">重点关注</div>
                    <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                </div>
                <div id="dinglj-his-star-list">
                    <div id="dinglj-history-list">
                        <div class="history-item dinglj-item" id="history-item-1">1_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-2">2_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-3">3_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-4">4_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-5">5_查看.png</div>
                    </div>
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
    </div>`;
}

/** 绘制行号 */
function drawLineNumber_001() {
    let res = get('1');
    let reg = /.*<a href="([0-9]+\/)".*/;
    context_001.lineNumbers = res.split('\n')
        .map(line =>  reg.test(line) ? reg.exec(line)[1] : '')
        .filter(href => href != '')
        .map(href => href.substring(0, href.length - 1))
        .map(number => `<div class="line-item dinglj-item" id="line-${ number }">${ number }</div>`)
        .join('');
    getById('dinglj-lines').innerHTML = context_001.lineNumbers;
    bindLineEvent_001();
}

function bindLineEvent_001() {
    let list = getByClass('line-item');
    for (let element of list) {
        element.addEventListener('click', e => {
            e.stopPropagation();
            toLine_001(context_001.focus, 'line', element);
            context_001.focus = 'line';
        })
    }
}

function toLine_001(oldScope, newScope, element, order = 'head', callback = () => {}) {
    toItem_001(oldScope, newScope, element, order, callback);
}

function toItem_001(oldScope, newScope, element, order, callback) {
    // 把旧作用域的 last 清除
    let lastElements = getByClass(`last ${ oldScope }-item`);
    for (let lastElement of lastElements) {
        lastElement.classList.remove('last');
    }
    // 把旧作用域的 active 标记为 last
    let activeElements = getByClass(`active ${ oldScope }-item`);
    for (let activeElement of activeElements) {
        activeElement.classList.add('last');
    }
    // 把当前元素标记为 active
    element.classList.add('active');
}