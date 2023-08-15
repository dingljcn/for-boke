function onload_XXX(callback) {
    // 引入通用脚本
    let utilScript = document.createElement('script');
    utilScript.type = 'text/javascript';
    utilScript.src = 'https://dingljcn.github.io/for-boke/beta/utils.js?' + Math.random();
    // 成功
    utilScript.onload = async function() {
        localStorage.setItem(`dinglj-util.js`, utilScript.src); // 缓存本次成功 load 的 url
        callback();
    }
    // 失败
    utilScript.onerror = () => {
        let lastURL = localStorage.getItem(`dinglj-util.js`);
        console.error(`${ utilScript.src } 拉取失败, 拉取上次成功的地址 ${ lastURL }`);
        utilScript.remove();
        appendScript(callback);
    }
    document.head.appendChild(utilScript);
}

function run_XXX(config) {
    // 检验配置
    context_xxx.config = config;
    logln('传入的配置: ', context_xxx.config);
    if (!isMatch(context_xxx.config)) {
        console.error('不符合以下地址匹配规则');
        console.error(context_xxx.config.matchList);
        return;
    }
    // 正式开始独立的逻辑
    exec_xxx();
}