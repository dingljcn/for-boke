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
    bindKeyboardEvent_001();
}

function initLayout_001() {
    document.body.style.margin = '0px';
    document.body.style.display = 'flex';
    document.body.style.height = '100%';
    document.body.style.flexDirection = 'column';
    const titlePadding = 10;
    document.body.innerHTML = `<div style="line-height: 40px; font-size: 14px; height: 40px; calc(100vw - (${ titlePadding * 2 })px); display: flex; background: #1f2328; color: white; font-weight: bold; padding: 0 ${titlePadding}px">
        <div style="">变更历史截图浏览</div>
        <div style="flex: 1"></div>
        <div style="display: flex">
            <div style="margin-left: 10px; cursor: pointer" onclick="window.open('默认步骤')">默认步骤截图</div>
            <div style="margin-left: 10px; cursor: pointer" onclick="window.open('erpLog')">ERP日志</div>
            <div style="margin-left: 10px; cursor: pointer" onclick="window.open('logs')">测试工具日志</div>
            <div style="margin-left: 10px; cursor: pointer" onclick="window.open('test.xls')">测试用例下载</div>
        </div>
    </div>
    <div style="flex: 1; display: flex; position: relative">
        <div style="height: 100%; max-width: 250px; min-width: 250px; display: flex">
            <div id="dinglj-line-number-container" style="text-align: center; max-width: 80px; min-width: 80px; overflow-y: scroll;"></div>
            <div id="dinglj-steps-container" style="text-align: center; flex: 1; overflow-y: scroll;"></div>
        </div>
        <div style="height: 100%; flex: 1; display: flex; flex-direction: column">
            <div id="dinglj-this-picture-info-conatiner" style="min-height: 40px; max-height: 40px"></div>
            <div style="flex: 1; position: relative">
                <img id="dinglj-this-picture" src="1/10/6_点击.png" style="box-shadow: 0 0 10px -3px grey; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 5px;max-width: 98%; max-height: 98%">
            </div>
            <div id="dinglj-this-picture-operate-container" style="min-height: 50px; max-height: 50px"></div>
        </div>
        <div style="height: 100%; max-width: 250px; min-width: 250px; display: flex; flex-direction: column">
            <div style="max-height: 40px; min-height: 40px; display: flex">
                <div style="flex: 1; text-align: center; line-height: 40px; cursor: pointer">浏览过的图</div>
                <div style="flex: 1; text-align: center; line-height: 40px; cursor: pointer">重点查看的图</div>
            </div>
        </div>
    </div>`;
    let maxHeight = getById('dinglj-line-number-container').offsetHeight + 'px';
    getById('dinglj-line-number-container').style.maxHeight = maxHeight;
    getById('dinglj-steps-container').style.maxHeight = maxHeight;
}

/** 绘制行号 */
async function drawLineNumber_001() {
    let reg = /.*<a href="([0-9]+\/)".*/;
    await get('1', res => {
        context_001.lineNumbers = res.split('\n')
            .map(line =>  reg.test(line) ? reg.exec(line)[1] : '')
            .filter(href => href != '')
            .map(href => href.substring(0, href.length - 1));
        let container = getById('dinglj-line-number-container');
        let data = context_001.lineNumbers.map(n => `<div class="line-number-item" id="line-number-${n}" style="margin: 2px 0; cursor: pointer">${n}</div>`).join('');
        container.innerHTML = data;
        bindClickEvent_001();
    });
}

/** 绑定各种切换事件 */
function bindClickEvent_001() {
    bindLineChangeEvent_001();
    onHistoryChange_001();
    onStarChange_001();
    let list = getByClass('line-number-item');
    if (list.length > 0) {
        list[0].click();
    }
}

/** 切换行事件 */
function bindLineChangeEvent_001() {
    let list = getByClass('line-number-item');
    listActiveChange(list, context_001.config.style.menu.activeStyle, context_001.config.style.menu.inActiveStyle, (element, event) => {
        changeToLine_001(element, element.innerText);
    });
}

/** 绘制行号 */
function changeToLine_001(element, lineNumber) {
    log(`点击第${ lineNumber }行`);
    let reg = /.*\.png">(.*.png)<\/a>.*/;
    get(`1/${ lineNumber }/`, res => {
        // 整理
        context_001.lineNumbers[lineNumber] = res.split('\n')
            .map(line =>  reg.test(line) ? reg.exec(line)[1] : '')
            .filter(href => href != '');
        // 绘制
        let container = getById('dinglj-steps-container');
        let data = context_001.lineNumbers[lineNumber].map(n => `<div class="step-item" id="step-${n}" style="margin: 2px 0; cursor: pointer; font-size: 14px; padding: 3px 0">${n}</div>`).join('');
        container.innerHTML = data;
        bindStepChangeEvent_001(lineNumber);
        let stepList = getByClass('step-item');
        if (stepList.length > 0) {
            stepList[0].click();
        }
    });
    let lastActiveList = getByClass('last-active-line') || [];
    for (let lastActive of lastActiveList) {
        if (lastActive != element) {
            lastActive.classList.remove('last-active-line');
        }
    }
    let activeList = getByClass('active-line') || [];
    for (let active of activeList) {
        if (active != element) {
            active.classList.remove('active-line');
            active.classList.add('last-active-line');
        }
    }
    element.classList.add('active-line');
}

/** 切换步骤事件 */
function bindStepChangeEvent_001(lineNumber) {
    let list = getByClass('step-item');
    listActiveChange(list, context_001.config.style.menu.activeStyle, context_001.config.style.menu.inActiveStyle, (element, event) => {
        changeToStep_001(element, lineNumber, element.innerText);
    });
}

function changeToStep_001(element, lineNumber, imageName) {
    let key = `1/${ lineNumber }/${ imageName }`;
    log(`点击第${ lineNumber }行的图片 ${ imageName }`);
    getById('dinglj-this-picture').src = key;
    addToHistory_001(lineNumber, imageName, key);
    let lastActiveList = getByClass('last-active-step') || [];
    for (let lastActive of lastActiveList) {
        if (lastActive != element) {
            lastActive.classList.remove('last-active-step');
        }
    }
    let activeList = getByClass('active-step') || [];
    for (let active of activeList) {
        if (active != element) {
            active.classList.remove('active-step');
            active.classList.add('last-active-step');
        }
    }
    element.classList.add('active-step');
}



function addToHistory_001(lineNumber, imageName, key) {
    if (!context_001.history) {
        context_001.history = [];
    }
    if (!context_001.history.includes(key)) {
        context_001.history.push(key);
        if (context_001.config.persist) {
            saveCache_001('history', lineNumber, imageName)
        }
    }
}

function readCache_001(propName = 'history') {
    let str = localStorage.getItem('dinglj-001-cache');
    let json = {};
    if (str) {
        json = JSON.parse(str);
    }
    let prop = json[propName];
    if (prop) { // history 或 star 存在才继续, 不存在则返回空数组
        return prop[window.location.href] || [];
    }
    return [];
}

function saveCache_001(propName = 'history', lineNumber, imageName) {
    let str = localStorage.getItem('dinglj-001-cache');
    let json = {};
    if (str) {
        json = JSON.parse(str);
    }
    let prop = {};
    if (json[propName]) {
        prop = json[propName];
    } else {
        json[propName] = prop;
    }
    let array = [];
    if (prop[window.location.href]) {
        array = prop[window.location.href];
    } else {
        prop[window.location.href] = array;
    }
    array.push(`1/${ lineNumber }/${ imageName }`);
}

/** 切换历史图片时 */
function onHistoryChange_001() {

}

/** 切换重点图片 */
function onStarChange_001() {

}

/** 绑定键盘事件 */
function bindKeyboardEvent_001() {
    bindUp_Down_001();
    bindLeft_Right_001();
}

/** 绑定上下键 */
function bindUp_Down_001() {
    window.addEventListener('keyup', e => {
        if (e.key == 'ArrowUp') {
            ToPrev_001(context_001.focus);
        } else if (e.key == 'ArrowDown') {
            ToNext_001(context_001.focus);
        }
    });
}

/** 向上移动 */
function ToPrev_001(scope = 'step') {
    if (scope == 'step') {
        let active = getByClass('active-step')[0];
        if (active.previousElementSibling == null) {
            ToPrev_001('line'); // 已经没有上一步, 则移动到上一行
        } else {
            active.previousElementSibling.click();
        }
    } else if (scope == 'line') {
        let active = getByClass('active-line')[0];
        if (active.previousElementSibling != null) {
            active.previousElementSibling.click();
        }
    }
}

/** 向下移动 */
function ToNext_001(scope = 'step') {
    if (scope == 'step') {
        let active = getByClass('active-step')[0];
        if (active.nextElementSibling == null) {
            ToNext_001('line');
        } else {
            active.nextElementSibling.click();
        }
    } else if (scope == 'line') {
        let active = getByClass('active-line')[0];
        if (active.nextElementSibling != null) {
            active.nextElementSibling.click();
        }
    }
}

/** 绑定左右键 */
function bindLeft_Right_001() {
    window.addEventListener('keyup', e => {
        let scope = context_001.focus;
        let next = scope;
        let len = context_001.layout.length;
        let i = context_001.layout.indexOf(scope);
        if (e.key == 'ArrowRight') {
            next = context_001.layout[(len + i + 1) % len];
        } else if (e.key == 'ArrowLeft') {
            next = context_001.layout[(len + i - 1) % len];
        }
        context_001.focus = next;
    });
}