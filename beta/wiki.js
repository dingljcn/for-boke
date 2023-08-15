const context_002 = {
    list: {
        myTickets: {
            name: '我的所有变更',
            data: {},
            defaultSort: (list = []) => { // return: { tabName, List<Ticket> }
                let result = {};
                for (let element of list) {
                    let reporter = element.reporter; // 以报告人进行分组
                    let array = result[reporter];
                    if (!array) {
                        array = [];
                        result[reporter] = array;
                    }
                    array.push(element);
                }
                return result;
            }
        },
        iReport: {
            name: '我提出的变更',
            data: {},
            defaultSort: (list = []) => list
        }
    },
    runtime: {
        realActive: '',
        activePage: () => context_002.runtime.realActive || (context_002.runtime.realActive = Object.keys(context_002.list)[0]),
    },
    config: {
        css: ''
    }
}

function onload_002(callback) {
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

function run_002(config) {
    // 检验配置
    context_002.config = config;
    logln('传入的配置: ', context_002.config);
    if (!isMatch(context_002.config)) {
        console.error('不符合以下地址匹配规则');
        console.error(context_002.config.matchList);
        return;
    }
    // 正式开始独立的逻辑
    exec_002();
}

function exec_002() {
    drawUI_002();
    getMyTickets_002();
}

function drawUI_002() {
    newElement('style', {
        parentNode: document.head
    }, {
        innerText: context_002.config.css
    }, []);
    getById('main').innerHTML = `<div id="dinglj-global-left">
        <div id="dinglj-page-nav-box">
            <div id="dinglj-nav-point"></div>
            <div id="dinglj-navs"> ${
                Object.keys(context_002.list)
                .map(key => `<div class="dinglj-nav-item ${ context_002.runtime.activePage() == key ? 'dinglj-active-nav' : '' }" id="dinglj-nav-${ key }">${ context_002.list[key].name }</div>`)
                .join('') 
            }</div>
        </div>
    </div>
    <div id="dinglj-global-right">
    </div>`;
    rmf(getById('footer'));
}

function getMyTickets_002() {
    $.get(context_002.config.url.myTickets).then(res => {
        console.log(1);
        let isTr = false;
        let item = '';
        let list = [];
        // 第一个 for 循环, 遍历返回的 response, 把每一行都提取出来
        for (let line of res.split('\n')) {
            if (/^\s*<tr class="color([0-9]+)-((even)|(odd))">\s*$/.test(line)) { // 开始 tr
                isTr = true;
            } else if (isTr) {
                if (/^\s*<\/tr>\s*$/.test(line)) { // 结束 tr
                    isTr = false;
                    item = item.replaceAll(/\s\s+/g, '').replaceAll(/\n/g, '').replaceAll(/<\/td>/g, '</td>\n');
                    list.push(item);
                    item = '';
                    continue;
                }
                item += line;
            }
        }
        // 第二个 for 循环, 遍历每一行变更, 转换为对象
        let elementList = [];
        for (let element of list) {
            let ticket = {};
            for (let line of element.split('\n')) {
                if (!line) {
                    continue;
                }
                let className = /<td class="(\w+)"/.exec(line)[1];
                let value = '';
                if (className == 'ticket' || className == 'summary') {
                    value = /<td class="\w+"><a.*>(.*)<\/a>/.exec(line)[1];
                } else {
                    value = /<td class="\w+">(.*)<\/td>/.exec(line)[1];
                }
                ticket[className] = value;
            }
            elementList.push(ticket);
        }
        // 最后, 对变更列表进行整理, 如果配置中自定义了逻辑, 则调用自定义逻辑, 否则使用默认逻辑
        if (context_002.config.sort.myTickets) {
            context_002.list.myTickets.data = context_002.config.sort.myTickets(elementList);
        } else {
            context_002.list.myTickets.data = context_002.list.myTickets.defaultSort(elementList);
        }
        fillMyTickets_002();
    })
}

function fillMyTickets_002() {

}