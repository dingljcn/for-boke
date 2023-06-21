let config = {};

const context = {};

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
}