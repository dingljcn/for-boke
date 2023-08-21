function prepare_scripts_002(loadScript, callback) {
    loadScript('utils.js', () => {
        loadScript('wiki/tool.js', () => {
            context_002.config = callback();
            run_002();
        })
    })
}

function run_002() {
    logln('传入的配置: ', context_002.config);
    if (!isMatch(context_002.config)) {
        console.error('不符合以下地址匹配规则');
        console.error(context_002.config.matchList);
        return;
    }
    // 正式开始独立的逻辑
    readCache_002();
    // 绘制整体界面
    drawUI_002();
    // 读取变更
    readMyTickets_002();
    // 监听时间
    listenTime(getById('dinglj-date'), getById('dinglj-week'), getById('dinglj-time'));
    // 自动展开
    if (context_002.presist.isAutoExpand) {
        getById('dinglj-ticket-area-head').children[0].click();
    }
    let timer = setInterval(() => {
        if (context_002.waitting == false) {
            clearInterval(timer);
            makePages_002();
            showPages_002();
        }
    }, 200);
}

function readMyTickets_002() {
    $.get(context_002.config.url).then(res => {
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
        for (let element of list) {
            let ticket = WikiTicket.getInstance(element);
            elementList.push(ticket);
        }
        context_002.source = elementList;
        context_002.waitting = false;
    })
}

function drawUI_002() {
    newElement('style', {
        parentNode: document.head
    }, {
        innerHTML: context_002.config.css
    }, []);
    rmf(getById('footer'));
    getById('main').innerHTML = `<div id="dinglj-home-view">
        <div id="dinglj-home-view-container">
            <div id="home-view-left">
                <div id="dinglj-avatar">${
                    context_002.config.whoami.zh.length == 1
                        ? context_002.config.whoami.zh
                        : context_002.config.whoami.zh.substring(context_002.config.whoami.zh.length - 2)
                }</div>
                <div id="dinglj-date"></div>
                <div id="dinglj-week"></div>
                <div id="dinglj-time"></div>
                <div id="dinglj-hrefs">${
                    Object.keys(context_002.config.hrefs).map(key => {
                        return `<div class="dinglj-href-item" onclick="window.open('${ context_002.config.hrefs[key] }')">${ key }</div>`
                    }).join('')
                }</div>
            </div>
            <div id="home-view-right">
            </div>
        </div>
    </div>
    <div  id="dinglj-global-tickes">
        <div id="dinglj-ticket-area-head">
            <div onclick="showTicketPages_002()">变更清单</div>
            <div onclick="showTicketPages_002()" style="flex: 1"></div>
            <div><input onclick="modifyAutoExpand()" type="checkbox" id="auto-expand" ${ context_002.presist.isAutoExpand ? 'checked="true"' : '' }/>自动展开</div>
        </div>
        <div id="dinglj-ticket-area-container">
            <div id="dinglj-global-left">
                <div id="dinglj-page-nav-box">
                    <div id="dinglj-nav-point"></div>
                    <div id="dinglj-navs"> ${
                        getPageNames()
                        .map(key => `<div class="dinglj-nav-item ${ context_002.runtime.activePage() == key ? 'dinglj-active-nav' : '' }" id="dinglj-nav-${ key }" onclick="changePage_002(id)">${
                            context_002.list[key].name
                        }</div>`)
                        .join('') 
                    }</div>
                </div>
            </div>
            <div id="dinglj-global-right">
                <div id="dinglj-page-view">${
                    getPageNames().map(key => `<div class="dinglj-page">
                        <div id="dinglj-page-wait-box">
                            <img style="width: 300px" src="https://dingljcn.github.io/for-boke/src/loading.gif"/>
                            <div>'${ context_002.list[key].name }' 页面数据加载中</div>
                        </div>
                    </div>`).join('')
                }/div>
            </div>
        </div>
    </div>`;
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
    return getPageNames().indexOf(key);
}

/** 分页 */
function makePages_002() {
    beforeMakePage_002();
    getMyTickets_002();
    getNotResolveTickets_002();
    getISubmitTickets_002();
}

/** 可以如果需要自己分页, 可以重写此方法 */
function beforeMakePage_002() {}

/** 我的所有变更 */
function getMyTickets_002() {
    let list = [];
    for (let element of context_002.source) {
        if (element.owner == context_002.config.whoami.zh) { // 属主是我
            list.push(element);
        }
    }
    // 对变更列表进行整理, 如果配置中自定义了逻辑, 则调用自定义逻辑, 否则使用默认逻辑
    if (context_002.config.makePage && context_002.config.makePage.myTickets) {
        context_002.list.myTickets.data = context_002.config.makePage.myTickets(list);
    } else {
        context_002.list.myTickets.data = context_002.list.myTickets.defaultMakeTab(list);
    }
}

/** 需要处理 */
function getNotResolveTickets_002() {
    let list = [];
    for (let element of context_002.source) {
        if (element.owner == context_002.config.whoami.zh && element.status.toLowerCase() != 'closed' && element.status.toLowerCase() != 'fixed') { // 属主是我, 没有关闭的
            list.push(element);
        }
    }
    // 对变更列表进行整理, 如果配置中自定义了逻辑, 则调用自定义逻辑, 否则使用默认逻辑
    if (context_002.config.makePage && context_002.config.makePage.notResolve) {
        context_002.list.notResolve.data = context_002.config.makePage.notResolve(list);
    } else {
        context_002.list.notResolve.data = context_002.list.notResolve.defaultMakeTab(list);
    }
}

/** 我提出的变更 */
function getISubmitTickets_002() {
    let list = [];
    for (let element of context_002.source) {
        if (element.reporter == context_002.config.whoami.zh) { // 报告人是我
            list.push(element);
        }
    }
    // 对变更列表进行整理, 如果配置中自定义了逻辑, 则调用自定义逻辑, 否则使用默认逻辑
    if (context_002.config.makePage && context_002.config.makePage.iReport) {
        context_002.list.iReport.data = context_002.config.makePage.iReport(list);
    } else {
        context_002.list.iReport.data = context_002.list.iReport.defaultMakeTab(list);
    }
}

function showPages_002() {
    let styleModify = [];
    getById('dinglj-page-view').innerHTML = getPageNames()
        .map(pageName => {
            let page = context_002.list[pageName];
            return `<div class="dinglj-page">${
                `<div class="page-title">
                    <div class="dinglj-float-nav"></div>
                    ${ getTableNames(pageName)
                        .map(tabName => `<div class="page-name" 
                            onclick="changeTab_002('${ pageName }-${ tabName.replace(' ', '') }-table', '${ getTableNames(pageName).indexOf(tabName) }')" 
                            id="${ pageName }-${ tabName.replace(' ', '') }-table">${ tabName }</div>`)
                        .join('')
                    }
                </div>` + // 此处是拼接 tab 页的标题
                `<div class="page-tables">${
                    genTables_002(pageName, page, styleModify)
                }</div>` // 此处是拼接表格的数据, 过于复杂, 所以放到函数里
            }</div>`
        })
        .join('\n');
    for (let floatNav of getByClass('dinglj-float-nav')) {
        let width = floatNav.nextElementSibling.offsetWidth;
        floatNav.style.width = `${ width }px`;
    }
    for (let func of styleModify) {
        func();
    }
}

function genTables_002(pageName, page, styleModify) {
    let tabs = page.data;
    return `<div class="dinglj-tables-view-box" style="width: ${ Object.keys(tabs).length }00%">${
        Object.keys(tabs).map(tableKey => {
            let table = tabs[tableKey];
            let display = calcFieldsToDisplay(pageName, page, tableKey, table);
            let func = () => {
                for (let column of display) {
                    if (column.en == context_002.config.columns.summary.en) {
                        continue;
                    }
                    let cells = getByClass(`cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }`);
                    let max = -1;
                    for (let cell of cells) {
                        max = Math.max(max, cell.offsetWidth);
                    }
                    for (let cell of cells) {
                        cell.style.width = `${ max }px`;
                    }

                }
            }
            if (context_002.config.order && context_002.config.order.rows) {
                for (let order of context_002.config.order.rows) {
                    table.sort((ticket1, ticket2) => {
                        let order1 = order.resolve(pageName, page, tableKey, table, null, null, {
                            idx: indexOfPropInList(table, context_002.config.columns.id.en, ticket1.id)
                        });
                        let order2 = order.resolve(pageName, page, tableKey, table, null, null, {
                            idx: indexOfPropInList(table, context_002.config.columns.id.en, ticket2.id)
                        });
                        return order1 - order2;
                    })
                }
            }
            styleModify.push(func);
            // 拼接每个表格的数据
            return `<div class="dinglj-table-view" style="width: calc(100% / ${ Object.keys(tabs).length })">
                <div class="dinglj-table-head">${ // 拼接表头字段
                    display.map(column => `<div class="dinglj-cell table-head cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }">${ column.zh }</div>`).join('')
                }</div>
                <div class="dinglj-table-line-box">${
                    // 拼接每一行数据
                    table.map(line => {
                        return `<div class="dinglj-table-line">${
                            // 拼接每一行的每一列
                            display.map(column => `<div class="dinglj-cell table-line cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }">${ line[column.en] }</div>`).join('')
                        }</div>`
                    }).join('')
                }</div>
            </div>`;
        }).join('') 
    }</div>`
}

function calcFieldsToDisplay(pageName, page, tableKey, table) {
    let displayColumns = [];
    for (let column of Object.values(context_002.config.columns)) {
        let ignore = false;
        for (let stratege of context_002.filters.col) {
            ignore = stratege.colFilter(pageName, page, tableKey, table, column.en, null);
            if (ignore) {
                break;
            }
        }
        if (!ignore && context_002.config.filters && context_002.config.filters.col) {
            for (let stratege of context_002.config.filters.col) {
                ignore = stratege.colFilter(pageName, page, tableKey, table, column.en, null);
                if (ignore) {
                    break;
                }
            }
        }
        if (!ignore) {
            displayColumns.push(column);
        }
    }
    return displayColumns;
}

function changeTab_002(elementID, tabIdx) {
    let element = getById(elementID);
    let parentNode = element.parentNode;
    let floatNav = parentNode.children[0];
    let container = parentNode.nextElementSibling.children[0];
    container.style.left = `-${ tabIdx }00%`;
    floatNav.style.width = `${ element.offsetWidth }px`;
    floatNav.style.left = `${ element.offsetLeft }px`;
}

function showTicketPages_002() {
    let element = getById('dinglj-global-tickes');
    if (element.style.bottom == '0px') {
        element.removeAttribute('style');
    } else {
        element.style.bottom = '0';
    }
}

function modifyAutoExpand() {
    context_002.presist.isAutoExpand = !context_002.presist.isAutoExpand;
    saveCache_002();
}