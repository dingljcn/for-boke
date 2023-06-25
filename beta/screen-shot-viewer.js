const dljCtx001 = {};

function run(callback) {
    appendScript(callback, `https://dingljcn.github.io/for-boke/beta/utils.js?${ Math.random() }`);
}

function appendScript(callback, url) {
    let remoteScript = document.createElement('script');
    remoteScript.type = 'text/javascript';
    remoteScript.src = url;
    document.head.appendChild(remoteScript);
    // 脚本加载成功, 缓存 url
    remoteScript.onload = () => {
        localStorage.setItem('dinglj-script-screen-shot-viewer-util', url);
        onUtilLoad(callback);
    };
    // 脚本读取失败, 读取上一次成功缓存的 url
    remoteScript.onerror = () => {
        let src = localStorage.getItem('dinglj-script-screen-shot-viewer-util');
        console.error(`${ url } 拉取失败, 拉取上次成功的地址 ${ src }`);
        remoteScript.remove();
        appendScript(src);
    }
}

function onUtilLoad(callback) {
    dljCtx001.config = callback();
    console.log('传入的配置: ');
    console.log(dljCtx001.config);
    if (!isMatch(dljCtx001.config)) {
        console.error('不符合以下地址匹配规则');
        console.error(dljCtx001.config.matchList);
        return;
    }
    initLayout();
    drawLineNumber();
    bindClickEvent();
}

function initLayout() {
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
                <img id="dinglj-this-picture" src="1/7/0_重启.png" style="box-shadow: 0 0 10px -3px grey; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 5px;max-width: 98%; max-height: 98%">
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

/** 读取行号 */
async function getLineNumbers() {
    let reg = /.*<a href="([0-9]+\/)".*/;
    await get('1', res => {
        dljCtx001.lineNumbers = res.split('\n')
            .map(line =>  reg.test(line) ? reg.exec(line)[1] : '')
            .filter(href => href != '')
            .map(href => href.substring(0, href.length - 1));
    });
}

/** 绘制行号 */
async function drawLineNumber() {
    await getLineNumbers();
    setTimeout(() => {
        let container = getById('dinglj-line-number-container');
        let data = dljCtx001.lineNumbers.map(n => `<div class="line-number-item" id="line-number-${n}" style="margin: 2px 0; cursor: pointer">${n}</div>`).join('');
        container.innerHTML = data;
    }, 500);
}

/** 绑定各种切换事件 */
function bindClickEvent() {
    onLineNumberChange();
    onStepChange();
    onHistoryChange();
    onStarChange();
}

/** 切换行时 */
function onLineNumberChange() {
    let list = getByClass('line-number-item');
    listActiveChange(list, dljCtx001.config.style.menu.activeStyle, dljCtx001.config.style.menu.activeStyle, (element, event) => {
        getSteps(element.innerText);
        setTimeout(() => {
            let container = getById('dinglj-steps-container');
            let data = dljCtx001.lineNumbers.map(n => `<div class="step-item" id="step-${n}" style="margin: 2px 0; cursor: pointer">${n}</div>`).join('');
            container.innerHTML = data;
        }, 500);
    });
}

/** 读取行号 */
async function getSteps(lineNumber) {
    let reg = /.*\.png">(.*.png)<\/a>.*/;
    await get(`1/${lineNumber}/`, res => {
        dljCtx001.lineNumbers[lineNumber] = res.split('\n')
            .map(line =>  reg.test(line) ? reg.exec(line)[1] : '')
            .filter(href => href != '')
    });
}

/** 切换步骤时 */
function onStepChange() {

}

/** 切换历史图片时 */
function onHistoryChange() {

}

/** 切换重点图片 */
function onStarChange() {

}