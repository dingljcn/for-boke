let config = {};

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
    config = callback();
    console.log('传入的配置: ');
    console.log(config);
    if (!isMatch(config)) {
        console.error('不符合以下地址匹配规则');
        console.error(config.matchList);
        return;
    }
    initLayout();
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
            <div id="dinglj-line-number-container" style="max-width: 80px; min-width: 80px"></div>
            <div id="dinglj-steps-container" style="flex: 1"></div>
        </div>
        <div style="height: 100%; flex: 1; display: flex; flex-direction: column">
            <div id="dinglj-this-picture-info-conatiner" style="min-height: 40px; max-height: 40px"></div>
            <div style="flex: 1; position: relative">
                <img id="dinglj-this-picture" src="1/5/0_重启.png" style="box-shadow: 0 0 10px -3px grey; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 5px;max-width: 98%; max-height: 98%">
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
}