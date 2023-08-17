const context_002 = {
    list: {
        notResolve: {
            name: '需要处理',
            data: {},
            defaultSort: (list = []) => { // return: { tabName, List<Ticket> }
                let result = {
                    '所有': []
                };
                for (let element of list) {
                    let component = element.component; // 以模块进行分组
                    let array = result[component];
                    if (!array) {
                        array = [];
                        result[component] = array;
                    }
                    array.push(element);
                    result['所有'].push(element);
                }
                return result;
            }
        },
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
            defaultSort: (list = []) => { // return: { tabName, List<Ticket> }
                let result = {};
                for (let element of list) {
                    let owner = element.owner; // 以属主进行分组
                    let array = result[owner];
                    if (!array) {
                        array = [];
                        result[owner] = array;
                    }
                    array.push(element);
                }
                return result;
            }
        },
    },
    source: [], // 我的所有变更都存储在这里
    runtime: {
        realActive: '',
        activePage: () => context_002.runtime.realActive || (context_002.runtime.realActive = Object.keys(context_002.list)[0]),
    },
    config: {
        css: ''
    },
    waitting: true,
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
    readMyTickets_002(); // 先读数据, 如果出了错, 就不会往下走了, 顺便还能容个错
    let timer = setInterval(() => {
        if (context_002.waitting == false) {
            clearInterval(timer);
            makePages_002();
            showPages_002();
        }
    }, 200);
}

function readMyTickets_002() {
    $.get(context_002.config.url.myTickets).then(res => {
        console.log(1);
        let isTr = false;
        let item = '';
        let list = [];
        // 第一个 for 循环, 遍历返回的 response, 把每一行都提取出来
        for (let line of res.split('\n')) {
            if (/^\s*<tr class="((odd)|(even)) prio[0-9]+">\s*$/.test(line)) { // 开始 tr
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
        // console.log(list); // 打开这行, 可以看第一个变更每个单元格的内容
        // 第二个 for 循环, 遍历每一行变更, 转换为对象
        let elementList = [];
        const withA = /<td.*><a.*>(.*)<\/a><\/td>/;
        const withSpan = /<td.*><span.*>(.*)<\/span><\/td>/;
        const simpleTd = /<td.*>(.*)<\/td>/;
        for (let element of list) {
            let data = element.split('\n');
            elementList.push({
                id: withA.exec(data[0])[1],
                summary: withA.exec(data[1])[1],
                owner: withSpan.exec(data[2])[1],
                status: simpleTd.exec(data[3])[1],
                reporter: withSpan.exec(data[4])[1],
                type: simpleTd.exec(data[5])[1],
                priority: simpleTd.exec(data[6])[1],
                component: simpleTd.exec(data[7])[1],
                resolution: simpleTd.exec(data[8])[1],
                time: withA.exec(data[9])[1],
                changetime: withA.exec(data[10])[1],
                plandate: simpleTd.exec(data[11])[1],
                pingtai: simpleTd.exec(data[12])[1],
                project: simpleTd.exec(data[13])[1],
                ticketclass: simpleTd.exec(data[14])[1],
                testadjust: simpleTd.exec(data[15])[1],
                testreport: simpleTd.exec(data[16])[1],
                testower1: simpleTd.exec(data[17])[1],
                keywords: simpleTd.exec(data[18])[1],
                cc: simpleTd.exec(data[19])[1]
            });
        }
        context_002.source = elementList;
        context_002.waitting = false;
    })
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
                .map(key => `<div class="dinglj-nav-item ${ context_002.runtime.activePage() == key ? 'dinglj-active-nav' : '' }" id="dinglj-nav-${ key }" onclick="changePage_002(id)">${ context_002.list[key].name }</div>`)
                .join('') 
            }</div>
        </div>
    </div>
    <div id="dinglj-global-right">
        <div id="dinglj-page-view">${
            Object.values(context_002.list).map(i => `<div class="dinglj-page">
                <div id="dinglj-page-wait-box">
                    <img style="width: 300px" src="https://dingljcn.github.io/for-boke/src/loading.gif"/>
                    <div>'${ i.name }' 页面数据加载中</div>
                </div>
            </div>`).join('')
        }/div>
    </div>`;
    rmf(getById('footer'));
}

/** 导航元素点击事件 */
function changePage_002(id) {
    if (!id) {
        return;
    }
    // 切换 item 本身的样式
    let className = 'dinglj-active-nav';
    let lastActive = getByClass(className)[0];
    if (lastActive) {
        lastActive.classList.remove(className);
    }
    let target = getById(id);
    target.classList.add(className);
    // 移动指示条
    let name = getNavEleName_002(target);
    let height = (getNavItemHeight_002() + 5) * indexOfNav_002(name);
    getById('dinglj-nav-point').style.top = `${ height }px`;
    // 显示界面滚动高度
    let relativeTop = getByClass('dinglj-page')[0].offsetHeight * indexOfNav_002(name) * -1;
    getById('dinglj-page-view').style.top = `${ relativeTop }px`;
}

/** 每个导航元素的名字 */
function getNavEleName_002(element) {
    return element.id.replace('dinglj-nav-', '');
}

/** 每个导航元素的高度 */
function getNavItemHeight_002() {
    return parseInt(getByClass('dinglj-nav-item')[0].offsetHeight || '0');
}

/** 当前导航元素的下标 */
function indexOfNav_002(key) {
    return Object.keys(context_002.list).indexOf(key);
}

function makePages_002() {
    getMyTickets_002();
    getNotResolveTickets_002();
    getISubmitTickets_002();
}

function getMyTickets_002() {
    let list = [];
    for (let element of context_002.source) {
        if (element.owner == context_002.config.whoami.zh) { // 属主是我
            list.push(element);
        }
    }
    // 对变更列表进行整理, 如果配置中自定义了逻辑, 则调用自定义逻辑, 否则使用默认逻辑
    if (context_002.config.sort.myTickets) {
        context_002.list.myTickets.data = context_002.config.sort.myTickets(list);
    } else {
        context_002.list.myTickets.data = context_002.list.myTickets.defaultSort(list);
    }
}

function getNotResolveTickets_002() {
    let list = [];
    for (let element of context_002.source) {
        if (element.owner == context_002.config.whoami.zh && element.status.toLowerCase() != 'closed' && element.status.toLowerCase() != 'fixed') { // 属主是我, 没有关闭的
            list.push(element);
        }
    }
    // 对变更列表进行整理, 如果配置中自定义了逻辑, 则调用自定义逻辑, 否则使用默认逻辑
    if (context_002.config.sort.notResolve) {
        context_002.list.notResolve.data = context_002.config.sort.notResolve(list);
    } else {
        context_002.list.notResolve.data = context_002.list.notResolve.defaultSort(list);
    }
}

function getISubmitTickets_002() {
    let list = [];
    for (let element of context_002.source) {
        if (element.reporter == context_002.config.whoami.zh) { // 报告人是我
            list.push(element);
        }
    }
    // 对变更列表进行整理, 如果配置中自定义了逻辑, 则调用自定义逻辑, 否则使用默认逻辑
    if (context_002.config.sort.iReport) {
        context_002.list.iReport.data = context_002.config.sort.iReport(list);
    } else {
        context_002.list.iReport.data = context_002.list.iReport.defaultSort(list);
    }
}

function showPages_002() {
    let styleModify = [];
    getById('dinglj-page-view').innerHTML = Object.keys(context_002.list)
        .map(pageName => {
            let page = context_002.list[pageName];
            return `<div class="dinglj-page">${
                `<div class="page-title">
                    ${ Object.keys(page.data).map(tabName => `<div class="page-name" id="page-name-${ tabName }">${ tabName }</div>`).join('') }
                </div>` + // 此处是拼接 tab 页的标题
                `<div class="page-tables">${
                    genTables_002(pageName, page, styleModify)
                }</div>` // 此处是拼接表格的数据, 过于复杂, 所以放到函数里
            }</div>`
        })
        .join('\n');
    for (let func of styleModify) {
        func();
    }
}

function genTables_002(pageName, page, styleModify) {
    let tabs = page.data;
    return `<div id="dinglj-tables-view-box" style="width: ${ Object.keys(tabs).length }00%">${
        Object.keys(tabs).map(tableKey => {
            let table = tabs[tableKey];
            let display = calcFieldsToDisplay(page, tableKey, table);
            // 拼接每个表格的数据
            return `<div id="dinglj-table-view" style="width: calc(100% / ${ Object.keys(tabs).length })">
                <div class="dinglj-table-head">${ // 拼接表头字段
                    display.map(column => `<div class="dinglj-cell table-head cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }">${ column.zh }</div>`).join('')
                }</div>${
                    // 拼接每一行数据
                    table.map(line => {
                        return `<div class="dinglj-table-line">${
                            // 拼接每一行的每一列
                            display.map(column => `<div class="dinglj-cell table-line cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }">${ line[column.en] }</div>`).join('')
                        }</div>`
                    }).join('')
                }
            </div>`;
        }).join('')
    }</div>`
}

function calcFieldsToDisplay(item, tableKey, table) {
    let colFilter = {
        display: Object.values(context_002.config.columns),
        ignore: [],
        toDisplay: function(column) {
            let idx = this.ignore.indexOf(column);
            if (idx >= 0) {
                this.ignore.splice(idx, 1);
            }
            idx = this.display.indexOf(column);
            if (idx == -1) {
                this.display.push(column);
            }
        },
        toIgnore: function(column) {
            let idx = this.display.indexOf(column);
            if (idx >= 0) {
                this.display.splice(idx, 1);
            }
            idx = this.ignore.indexOf(column);
            if (idx == -1) {
                this.ignore.push(column);
            }
        },
    }
    if (context_002.config.filters && context_002.config.filters.col) {
        for (let filter of context_002.config.filters.col) {
            filter(item.name, item, tableKey, table, colFilter);
        }
    }
    if (context_002.config.order && context_002.config.order.columns) {
        context_002.config.order.columns(colFilter.display);
    }
    return colFilter.display;
}