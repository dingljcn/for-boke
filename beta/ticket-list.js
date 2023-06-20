const context = {
    columns: []
}

function onUtils_Js_Load(callback) {
    // 引入通用脚本
    let utilScript = document.createElement('script');
    utilScript.type = 'text/javascript';
    utilScript.src = 'https://dingljcn.github.io/for-boke/beta/utils.js?' + Math.random();
    // 脚本加载完成之后读取开始读配置, 启动脚本
    utilScript.onload = async function() {
        callback();
    }
    document.head.appendChild(utilScript);
}

function run(config = null) {
    if (config == null) {
        alert('未传入配置项, 脚本终止执行');
        return;
    }
    if (isMatch(config)) {
        console.log('传入的配置项: ')
        console.log(config);
        getColumnsInURL();
        if (!context.columns.includes(config.groupBy)) {
            let groupColumn = config.columns[config.groupBy];
            alert(`当前显示的列中没有分组列: ${ groupColumn.en } - ${ groupColumn.zh }`);
            return;
        }
        readTickets(config.ticketTypes);
    } else {
        console.log('当前网址不符合以下匹配规则:');
        console.log(config.matchList);
    }
}

function getColumnsInURL() {
    for (let kv of window.location.href.split('&')) {
        if (/^col=[A-Za-z0-9]+$/.test(kv)) { // 是 col=value 形式的键值对
            let value = kv.split('=')[1];
            context.columns.push(value);
        }
    }
}

/** 根据传入的 class 集合依次读取变更 */
function readTickets(ticketClass = []) {
    for (let className of ticketClass) {
        readTicketsByClassName(className);
    }
}

/** 读具体某个 class 对应的所有变更 */
function readTicketsByClassName(className = '') {
    if (className == '') {
        return;
    }
}