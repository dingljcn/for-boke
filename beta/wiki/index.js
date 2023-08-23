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
    readFirstRevision_002();
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
    // id 能够点击, 打开变更
    for (let element of getByClass('table-line cell-id')) {
        let number = element.innerText.substring(1);
        if (!isNaN(number)) {
            element.style.cursor = 'pointer';
            element.style.color = context_002.config.css_const.themeColor;
            element.addEventListener('click', () => {
                window.open(`${ context_002.config.ticketURL }/${ number }`);
            })
        }
    }
}

function genTables_002(pageName, page, styleModify) {
    let tabs = page.data;
    let tableNames = getTableNames(pageName);
    return `<div class="dinglj-tables-view-box" style="width: ${ tableNames.length }00%">${
        tableNames.map(tableKey => {
            let table = tabs[tableKey];
            let displayColumns = calcFieldsToDisplay(pageName, page, tableKey, table);
            // 该函数用于调整最佳列宽, 在所有数据渲染完成之后才会被触发
            styleModify.push(() => {
                for (let column of displayColumns) { // 遍历所有列
                    if (column.en == context_002.config.columns.summary.en) { // 除了概述列
                        continue;
                    }
                    let cells = getByClass(`cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }`); // 去除该页面, 该 table, 该列的所有单元格数据
                    let max = -1;
                    for (let cell of cells) { // 遍历该列每个单元格, 取最大的宽度
                        max = Math.max(max, cell.offsetWidth);
                    }
                    for (let cell of cells) { // 给该列设置统一的宽度
                        cell.style.width = `${ max }px`;
                    }

                }
            });
            // 行过滤
            let displayLines = [];
            if (context_002.config.filters && context_002.config.filters.row) {
                for (let idx = 0; idx < table.length; idx++) { // 遍历每一行
                    let ignore = false;
                    for (let stratege of context_002.config.filters.row) { // 遍历每个过滤策略
                        let result = stratege.rowFilter(pageName, page, tableKey, table, idx);
                        if (result) { // 任意策略是隐藏, 就退出
                            ignore = true;
                            break;
                        }
                    }
                    if (!ignore) { // 不隐藏才加入显示 list
                        displayLines.push(table[idx]);
                    }
                }
            } else {
                displayLines = table;
            }
            // 行排序
            if (context_002.config.line && context_002.config.line.order) {
                displayLines.sort((ticket1, ticket2) => {
                    for (let order of context_002.config.line.order) { // 遍历所有排序策略
                        let result = order.resolve(pageName, page, tableKey, displayLines, ticket1, ticket2);
                        if (result != 0) { // 不为 0, 就是比较出了大小, 否则就继续比较
                            return result;
                        }
                    }
                    return parseInt(ticket2.id.substring(1)) - parseInt(ticket1.id.substring(1)); // 默认按照变更号倒序排列
                })
            }
            // 拼接每个表格的数据
            return `<div class="dinglj-table-view" style="width: calc(100% / ${ tableNames.length })">
                <div class="dinglj-table-head">${ // 拼接表头字段
                    displayColumns.map(column => `<div class="dinglj-cell table-head cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }">${ column.zh }</div>`).join('')
                }</div>
                <div class="dinglj-table-line-box">${
                    // 拼接每一行数据
                    displayLines.map(line => {
                        return `<div class="dinglj-table-line">${
                            // 拼接每一行的每一列
                            displayColumns.map(column => `<div class="dinglj-cell table-line cell-in-page-${ pageName } cell-in-tab-${ tableKey } cell-${ column.en }">${ line[column.en] }</div>`).join('')
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
        if (context_002.config.filters && context_002.config.filters.col) {
            for (let stratege of context_002.config.filters.col) {
                ignore = stratege.colFilter(pageName, page, tableKey, table, column.en);
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

function readFirstRevision_002() {
    $.get(context_002.config.urls.root).then(res => {
        let revisions = [];
        for (let line of res.split('\n')) {
            line = line.trim();
            if (context_002.config.regex.getRevision.test(line)) {
                revisions.push(context_002.config.regex.getRevision.exec(line)[1]);
            }
        }
        let start = Math.max(...revisions);
        readSubmitRecords_002(start);
    })
}

function readSubmitRecords_002(start, step = 100) {
    if (!context_002.config.urls.baseURL) {
        return;
    }
    let end = 131000;
    if (context_002.presist.submitList && context_002.presist.submitList.length > 0) { // 存在本地缓存, 则读取到最后一个版本即可
        end = Math.max(...context_002.presist.submitList.map(i => i.revision));
    }
    let round = Math.ceil((start - end) / step);
    let result = {};
    let fromRev = start;
    for (let i = 0; i < round && fromRev > 0; i++) {
        let data = {
            success: false,
            list: [],
        };
        result[fromRev] = data;
        let url = `${ context_002.config.urls.baseURL }/log/${ context_002.config.urls.relativeURL }?rev=${ fromRev }`;
        $.get(url).then(response => {
            resolveResponse_002(response, data.list);
            data.success = true;
        });
        fromRev -= step;
    }
    let timer = setInterval(() => {
        let flags = Object.values(result).map(obj => obj.success ? 1 : 0);
        let sum = flags.reduce((prev, curr, idx, flags) => {
            return prev + curr;
        });
        if (Object.keys(result).length == sum) {
            clearInterval(timer);
            context_002.presist.submitList = context_002.presist.submitList || [];
            Object.values(result).map(obj => obj.list).forEach(list => {
                for (let element of list) {
                    if (indexOfPropInList(context_002.presist.submitList, 'revision', element.revision) == -1) {
                        context_002.presist.submitList.push(element);
                    }
                }
            });
            saveCache_002();
            // 读取结束, 显示 minimap
            drawMinimap();
            fillMinimap();
            afterFill();
        }
    }, 1000);
}

function resolveResponse_002(response = '', list) {
    let nameRegex = new RegExp(`.*${ context_002.config.whoami.zh }.*`);
    let originHTML = '';
    let merge = false;
    for (let line of response.split('\n')) {
        if (/<tr class="(odd)|(even)">/.test(line)) {
            merge = true;
            continue;
        } else if (/<\/tr>/.test(line)) {
            if (originHTML.trim()) {
                if (nameRegex.test(originHTML)) {
                    let element = {
                        revision: / title="浏览版本 (\d+)">/.exec(originHTML)[1],
                        author: /<td class="author"><span class="trac-author">(\S+)<\/span><\/td>/.exec(originHTML)[1],
                        date: />(\d{4}年\d{1,2}月\d{1,2}日) ..\d{1,2}:\d{1,2}:\d{1,2}<\/a>/.exec(originHTML)[1],
                        time: />\d{4}年\d{1,2}月\d{1,2}日 ..(\d{1,2}:\d{1,2}:\d{1,2})<\/a>/.exec(originHTML)[1]
                    };
                    list.push(element);
                }
                originHTML = '';
            }
            merge = false;
            continue;
        }
        if (merge) {
            originHTML += line + '\n';
        }
    }
}

const maxWeek = 53;

function drawMinimap() {
    let html = '';
    for (let i = 0; i <= maxWeek; i++) {
        html = `<div id="week-${ i }" class="minimap-week">${ drawWeek(i) }</div>${ html }`;
    }
    getById('home-view-right').innerHTML = `<div id="minimap-container">${ html }</div>`;
}

function drawWeek(weekNumber) {
    let html = `<div id="day-${ weekNumber }-${ 999 }" class="week-999 day-of-week"></div>`;
    for (let i = 0; i < 7; i++) {
        html += `<div id="day-${ weekNumber }-${ i }" class="week-${ i } day-of-week"></div>`;
    }
    return html;
}

function fillMinimap(day = new Date(), curWeek = 0) {
    if (curWeek >= maxWeek) {
        return;
    }
    let weekday = day.getDay();
    let day4Event = day.clone();
    let date = `${ day4Event.getFullYear() }年${ day4Event.getMonth() + 1 }月${ day4Event.getDate() }日`;
    let element = getById(`day-${ curWeek }-${ weekday }`);
    element.style.display = 'block';
    getCommitStatistic(element, day4Event, date);
    element.addEventListener('click', () => {
        alert(`${ date }提交了 ${ getCommitStatistic(element, day4Event, date).length } 次`);
    });
    if (weekday == 0) {
        curWeek++;
    }
    day.setDate(day.getDate() - 1);
    fillMinimap(day, curWeek);
}

function getCommitStatistic(element, day4Event, date) {
    if (context_002.minimap[date]) {
        return context_002.minimap[date];
    }
    context_002.minimap[date] = findByPropInList(context_002.presist.submitList, 'date', date);
    if (context_002.minimap[date].length == 0) {
        element.style.background = context_002.config.css_const.minimap.level1;
    } else if (context_002.minimap[date].length < 5) {
        element.style.background = context_002.config.css_const.minimap.level2;
    } else if (context_002.minimap[date].length < 10) {
        element.style.background = context_002.config.css_const.minimap.level3;
    } else if (context_002.minimap[date].length < 15) {
        element.style.background = context_002.config.css_const.minimap.level4;
    } else {
        element.style.background = context_002.config.css_const.minimap.level5;
    }
    element.classList.add(`year-of-${ day4Event.getFullYear() + 1 }`)
    element.classList.add(`month-of-${ day4Event.getMonth() + 1 }`)
    element.classList.add(`day-of-${ day4Event.getDate() + 1 }`)
    return context_002.minimap[date];
}

function afterFill() {
    let week = getById('week-53');
    for (let i = 0; i <= 7; i++) {
        let text = '';
        switch(i) {
            case 2: text = 'Mon'; break;
            case 4: text = 'Wed'; break;
            case 6: text = 'Fir'; break;
        }
        week.children[i].style.display = 'block';
        week.children[i].style.textAlign = 'right';
        week.children[i].style.width = '33px';
        week.children[i].style.fontSize = '12px';
        week.children[i].innerText = text;
    }
    let prev = 0;
    let list = getByClass('week-999');
    for (let i = 0; i < list.length; i++) {
        let element = list[i];
        element.style.display = 'block';
        if (i == 0) {
            continue;
        }
        console.log(element.nextElementSibling.classList);
        for (let clazz of element.nextElementSibling.classList) {
            if (clazz.startsWith('month-of-')) {
                let month = parseInt(clazz.replace('month-of-', ''));
                if (prev != month) {
                    prev = month;
                    element.innerText = month;
                }
            }
        }
    }
}