class Cell {
    key; name; value;
    /**
     * @param {string} key 列标识
     * @param {string} name 列名
     * @param {string} value 值
     * @param {Ticket} ticket 该列属于的变更
     */
    constructor(key, name, value, ticket) {
        this.key = key;
        this.name = name;
        this.value = value;
        ticket.cells.push(this);
    }
}

class Ticket {
    cells = []
    findCell(cellKey) {
        let result = this.cells.filter(cell => cell.key == cellKey);
        return result.length == 1 ? result[0] : null;
    }
    get(cellKey) {
        let cell = this.findCell(cellKey);
        return cell == null ? null : cell.value;
    }
}

class GroupStratege {
    columnKey; expectValue; groupName; resolve; columnMatched = false; // columnMatched: 表示是否显示了 columnKey 这个字段
    /**
     * @param {string} columnKey 要判断的是哪一列
     * @param {string | Array} expectValue 期待的值是什么
     * @param {string} groupName 要个分组取的名字
     * @param {function} resolve 自定义逻辑
     */
    constructor(columnKey, expectValue = '', groupName, resolve = null) {
        this.columnKey = columnKey;
        this.groupName = groupName;
        this.resolve = resolve;
        if (expectValue instanceof Array) {
            this.expectValue = expectValue;
        } else {
            this.expectValue = [ expectValue ];
        }
    }
    
    /**
     * 如果 columnKey 符合策略的 columnKey, 优先判断 resolve, 如果没有 resolve, 则看期待的值中是否包含该列的值
     * @param {Ticket} ticket 该变更
     * @param {string} columnKey 某一列的列名
     * @param {string} value 该列的值
     * @returns 
     */
    exec(ticket, columnKey, value) {
        if (columnKey != this.columnKey) {
            return false;
        }
        this.columnMatched = true;
        if (this.resolve != null) {
            return this.resolve(ticket, value);
        }
        return this.expectValue.includes(value);
    }
}

class TabPageStratege {
    groupName; tabName; tabId; columnKey; expectValue; resolve; list = [];
    constructor(groupName = '*', tabName = '', columnKey, expectValue = '', resolve = null) {
        this.groupName = groupName;
        this.tabName = tabName;
        this.tabId = uuid('tab-page');
        this.columnKey = columnKey;
        this.resolve = resolve;
        context.tabPathIdMap[tabName] = this.tabId;
        if (expectValue instanceof Array) {
            this.expectValue = expectValue;
        } else {
            this.expectValue = [ expectValue ];
        }
    }
    /**
     * 把变更加入这个 tab 页
     * @param {string} groupName 分组名
     * @param {Ticket} ticket 变更数据
     */
    push(groupName, ticket) {
        if (this.groupName != '*' && this.groupName != groupName) {
            if (this.groupName.startsWith('!')) {
                if (this.groupName.substring(1) == groupName) {
                    return; // 假设 this.groupName = !A, groupName = A, 那么该 groupName 就不在考虑范围内, 返回
                }
            } else {
                return;
            }
        }
        let cell = ticket.findCell(this.columnKey);
        let flag1 = cell != null && this.expectValue.includes(cell.value);
        let flag2 = this.resolve != null && this.resolve(groupName, ticket, cell);
        if (flag1 || flag2) {
            this.list.push(ticket);
        }
    }
}

class OrderStratege {
    columnKey; order; resolve;
    constructor(columnKey = '', order, resolve = null) {
        this.columnKey = columnKey;
        this.resolve = resolve;
        if (order instanceof Array) {
            this.order = order;
        } else {
            this.order = [ order ];
        }
    }
    /**
     * 根据 order 数组顺序比较变更中的 columnKey 字段值, 当然, 如果维护了 reoslve, 则以 resolve 为主
     * @param {Ticket} ticket1 变更1
     * @param {Ticket} ticket2 变更2
     */
    compare(ticket1, ticket2) {
        if (this.resolve == null) {
            let n1 = ticket1.get(this.columnKey);
            let n2 = ticket2.get(this.columnKey);
            if (n1 == null || n2 == null) {
                return 0;
            }
            let idx1 = this.order.indexOf(n1);
            idx1 = idx1 == -1 ? 999999 : idx1;
            let idx2 = this.order.indexOf(n2);
            idx2 = idx2 == -1 ? 999999 : idx2;
            return idx1 - idx2;
        } else {
            return this.resolve(ticket1, ticket2, this.columnKey);
        }
    }
}

class Filter {
    groupName; tabName; columnKey; expectValue; resolve;
    constructor(groupName = '*', tabName = '*', columnKey, expectValue, resolve = null) {
        this.groupName = groupName;
        this.tabName = tabName;
        this.columnKey = columnKey;
        this.resolve = resolve;
        if (expectValue instanceof Array) {
            this.expectValue = expectValue;
        } else {
            this.expectValue = [ expectValue ];
        }
    }
    /**
     * 如果 groupName 和 tabName 匹配, 且 ticket.columnKey 的值包含在 expectValue 中, 返回 true (当然, 也可自定义逻辑 resolve)
     * @param {string} groupName 分组
     * @param {string} tabName tab
     * @param {Ticket[]} list 该 tab 页下所有变更
     * @param {Ticket} ticket 变更
     * @param {Cell} cell 列
     */
    condition(groupName, tabName, list = [], ticket, cell) {
        if (isValid(this.groupName, groupName) && isValid(this.tabName, tabName)) {
            if (this.resolve == null) {
                if (cell.key == this.columnKey) {
                    let cellValue = ticket.get(this.columnKey);
                    return this.expectValue.includes(cellValue)
                }
                return false;
            } else {
                return this.resolve(groupName, tabName, list, ticket, cell);
            }
        }
        return false;
    }
}

function isValid(expect, value) {
    if (expect == '*') {
        return true;
    }
    if (expect.startsWith('!')) {
        return expect.substring(1) != value;
    }
    return expect == value;
}

const context = {
    config: {},
    columns: [],
    groups: {},
    groupNames: [],
    groupNameIdMap: {},
    tabPathIdMap: {},
    ignoreColumns: []
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
    context.config = config;
    if (isMatch(context.config)) {
        console.log('传入的配置项: ')
        console.log(context.config);
        getColumnsInURL();
        if (!context.columns.includes(context.config.groupBy)) {
            let groupColumn = context.config.columns[context.config.groupBy];
            alert(`当前显示的列中没有分组列: ${ groupColumn.en } - ${ groupColumn.zh }, 你需要将该列放出来, 或者修改脚本中的 config.groupBy 为你想要的分组列`);
            return;
        }
        readTickets();
        logNotMatchGroup();
        sortGroupNames();
        drawUI();
    } else {
        console.log('当前网址不符合以下匹配规则:');
        console.log(context.config.matchList);
    }
}

function getColumnsInURL() {
    for (let kv of window.location.href.split('&')) {
        if (/^col=[A-Za-z0-9]+$/.test(kv)) { // 是 col=value 形式的键值对
            let value = kv.split('=')[1];
            context.columns.push(value);
        }
        if (/^group=[A-Za-z0-9]+$/.test(kv)) { // 是 group=value 形式的键值对
            let groupBy = kv.split('=')[1];
            context.config.groupBy = context.config.groupBy || groupBy;
        }
    }
}

/** 根据传入的 class 集合依次读取变更 */
function readTickets(ticketClass = context.config.ticketTypes) {
    for (let className of ticketClass) {
        readTicketsByClassName(className);
    }
}

/** 读具体某个 class 对应的所有变更 */
function readTicketsByClassName(className = '') {
    if (className == '') {
        return;
    }
    for (let tr of document.getElementsByClassName(className)) {
        // 切割后除开第一个元素, 其他元素和 url 中出现的字段一一对应, 比如 tdDatas[1] 一般就是 id 这一列
        let tdDatas = tr.innerText.split('\t');
        let ticket = new Ticket();
        for (let i = 1; i < tdDatas.length; i++) {
            let cellValue = tdDatas[i];
            let cellKey = context.columns[i - 1];
            let cellName = context.config.columns[cellKey].zh;
            new Cell(cellKey, cellName, cellValue.trim(), ticket);
        }
        // 按 config.groupBy 分组
        let groupByKey = context.config.groupBy;
        let cell = ticket.findCell(groupByKey);
        pushToProp(context.groups, cell.value, ticket);
        // 再按分组策略分组
        ticket.cells.forEach(cell => {
            for (let groupStratege of context.config.stratege.group) {
                if (groupStratege.exec(ticket, cell.key, cell.value)) {
                    pushToProp(context.groups, groupStratege.groupName, ticket);
                }
            }
        });
    }
}

function logNotMatchGroup() {
    for (let groupStratege of context.config.stratege.group) {
        if (!groupStratege.columnMatched) {
            console.error(`分组策略 ${ groupStratege.groupName } 中要求匹配的字段是 ${ groupStratege.columnKey }, 但该字段没有被放出来, 所以该分组创建失败`);
        }
    }
}

function sortGroupNames() {
    context.groupNames = Object.keys(context.groups);
    context.groupNames.sort((i1, i2) => {
        // 先按分组策略来, 即自定义分组策略的排在最前面
        let idx1 = indexOfPropInList(context.config.stratege.group, 'groupName', i1);
        idx1 = idx1 == -1 ? 999999 : idx1;
        let idx2 = indexOfPropInList(context.config.stratege.group, 'groupName', i2);
        idx2 = idx2 == -1 ? 999999 : idx2;
        if (idx1 != idx2) { // 分组策略 list 中肯定有先后顺序, 其他全为 -1 (999999)
            return idx1 - idx2;
        }
        // 其次按 preferGroups 排序, 不过 perferGroups 只是个可选配置, 所以得判断下到底存不存在
        if (context.config.preferGroups) {
            let idx1 = context.config.preferGroups.indexOf(i1);
            idx1 = idx1 == -1 ? 999999 : idx1;
            let idx2 = context.config.preferGroups.indexOf(i2);
            idx2 = idx2 == -1 ? 999999 : idx2;
            if (idx1 != idx2) {
                return idx1 - idx2;
            }
        }
        // 最后按 ASCII 码排
        return i1 < i2;
    })
}

/** 绘制UI */
function drawUI() {
    let menus = context.groupNames.map(groupName => {
        let groupId = uuid('group');
        context.groupNameIdMap[groupName] = groupId;
        return `<div style="cursor: pointer; transition: 0.4s; padding: 10px; margin: 5px; border-radius: 5px; position: relative; overflow: hidden" class="dinglj-nav-group-item" id=${ groupId }>
            <div class="dinglj-nav-group-item-background" style="background-color: ${ context.config.style.guide.active.background }; transition: 0.4s; position: absolute; top: 0px; left: 0px; width: 0%; height: 100%"></div>
            <div style="position: relative; z-index: 999">${ groupName }</div>
        </div>`
    }).join('');
    getById('main').innerHTML = `<div style="display: flex; margin: 30px 0">
        <div id="dinglj-nav-container" style="width: ${ context.config.style.guide.width }; min-width: ${ context.config.style.guide.width }; padding: 10px">
            ${ menus }
        </div>
        <div id="dinglj-view-area" style="padding: 10px;flex: 1">
            <div id="dinglj-tab-name" style="position: relative; display: flex; margin: 5px 0;"></div>
            <div id="dinglj-tab-view" style="overflow-x: hidden; position: relative; height: 100%;">
                <div id="dinglj-ticket-view" style="position: absolute; top: 20px; left: 0; transition: 0.4s"></div>
            </div>
        </div>
    </div>`;
    let navItems = getByClass('dinglj-nav-group-item');
    let navItemsBackground = getByClass('dinglj-nav-group-item-background');
    listActiveChange(navItems, {
        boxShadow: '0 0 10px -3px grey',
        color: context.config.style.guide.active.color,
        fontWeight: 'bold',
    }, {
        boxShadow: 'none',
        color: context.config.style.guide.inActive.color,
        fontWeight: 'normal',
    }, (element, event) => {
        toggleStyle(navItemsBackground, element.children[0], {
            width: '100%'
        }, {
            width: '0%'
        })
        displayTickets(element);
    });
    navItems[0].click();
}

function displayTickets(element) {
    let groupName = element.children[1].innerText;
    let list = context.groups[groupName];
    dispatchTab(groupName, list);
    drawTabHead(groupName);
    console.log(context.config.stratege.tab);
}

function dispatchTab(groupName, list = []) {
    // 先清空原来的
    for (let stratege of context.config.stratege.tab) {
        stratege.list = [];
    }
    // 再重新分发
    for (let ticket of list) {
        for (let stratege of context.config.stratege.tab) {
            stratege.push(groupName, ticket);
        }
    }
}

/** 绘制 tab 头 */
function drawTabHead(groupName) {
    const margin = 5;
    // 只显示有变更的 tab 页
    let tabStrateges = context.config.stratege.tab.filter(stratege => stratege.list.length > 0);
    let tabHTML = tabStrateges.map(stratege => {
        return `<div class="tab-name-item" id="${ stratege.tagId }" style="cursor: pointer; transition: 0.4s; padding: 5px; margin: ${ margin }px">${ stratege.tabName }</div>`;
    }).join('');
    getById('dinglj-tab-name').innerHTML = `${ tabHTML }<div id="tab-name-underline" style="height: 3px; width: 60px; transition: 0.4s; background: ${ context.config.style.tab.underlineColor }; position: absolute; bottom: 0px; left: 0px"></div>`;
    let list = getByClass('tab-name-item');
    if (list.length == 0) {
        return;
    }
    // 获取并固定显示变更区域的宽度
    let container = getById('dinglj-tab-view');
    let containerWidth = container.offsetWidth;
    container.style.maxWidth = `${ containerWidth }px`;
    // 显示变更再界面上
    drawTabPage(groupName, containerWidth, tabStrateges);
    // 把下划线设置为第一个 tabName 的长度
    let firstTabPage = getByClass('tab-name-item')[0];
    let width = firstTabPage.offsetWidth + (margin * 2);
    let underLine = getById('tab-name-underline');
    underLine.style.width = `${ width }px`;
    // 切换 tab 页时
    listActiveChange(list, {
        fontWeight: 'bold',
        color: context.config.style.tab.activeColor
    }, {
        fontWeight: 'normal',
        color: 'black'
    }, (element, event) => {
        let width = element.offsetWidth + margin * 2;
        let left = element.offsetLeft - margin;
        underLine.style.width = `${ width }px`;
        underLine.style.left = `${ left }px`;
        let idx = indexOfPropInList(tabStrateges, 'tabName', element.innerHTML);
        for (let item of getByClass('dinglj-ticket-list')) {
            setTimeout(() => {
                item.style.opacity = 1;
            }, 400)
        }
        getById('dinglj-ticket-view').style.left = `${ -1 * idx * containerWidth }px`;
    });
    list[0].click();
}

/** 绘制 */
function drawTabPage(groupName, containerWidth, tabStrateges) {
    // 根据要显示的 tab 页数量设置容器宽度
    getById('dinglj-ticket-view').style.width = `${ containerWidth * tabStrateges.length }px`;
    let views = tabStrateges.map(stratege => {
        return `<div class="dinglj-ticket-list" style="transition: 0.4s; width: ${ containerWidth }px; display: inline-block; opacity: 0; vertical-align: top;">
            <div style="width: 100%">
                ${ genTHead(groupName, stratege) }
                ${ genTBody(groupName, stratege) }
            </div>
        </div>`;
    }).join('');
    getById('dinglj-ticket-view').innerHTML = views;
    fixStyle();
    fixTicketHref();
}

function genTHead(groupName, stratege) {
    let ignore = {};
    let tdList = stratege.list[0].cells.map(cell => {
        for (let filter of context.config.filter.column) {
            if (filter.condition(groupName, stratege.tabName, stratege.list, stratege.list[0], cell)) {
                ignore[cell.key] = '';
                return '';
            }
        }
        return `<div style="min-width: 80px; max-width: 80px; text-align: center; font-weight: bold; padding: 0 5px; line-height: 30px" class="dinglj-col-${ cell.key }">${ cell.name }</div>`
    }).join('');
    context.ignoreColumns = Object.keys(ignore);
    return `<div class="dinglj-table-head" style="padding: 5px 0; display: flex">${ tdList }</div>`;
}

function genTBody(groupName, stratege) {
    let count = 0;
    stratege.list.sort((ticket1, ticket2) => {
        for (let orderStratege of context.config.stratege.order) { // 按下标顺序遍历所有排序策略, 如果比较出了先后则返回结果, 否则进入下一个策略, 直到所有策略都走一遍
            let result = orderStratege.compare(ticket1, ticket2);
            if (result != 0) {
                return result;
            }
        }
        // 所有策略都没比较出大小, 最后就按变更号顺序排
        let id1 = parseInt(ticket1.get(context.columns.id.en).substring(1));
        let id2 = parseInt(ticket2.get(context.columns.id.en).substring(1));
        return id1 - id2;
    })
    return stratege.list.map(ticket => {
        let tdList = ticket.cells.map(cell => {
            if (context.ignoreColumns.includes(cell.key)) {
                return '';
            }
            let ignoreRow = false;
            for (let filter of context.config.filter.row) {
                if (filter.condition(groupName, stratege.tabName, stratege.list, ticket, cell)) {
                    ignoreRow = true;
                    break;
                }
            }
            return ignoreRow ? '' : `<div class="dinglj-column-data-${ cell.key }" style="min-width: 80px; max-width: 80px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; text-align: center; padding: 0 5px; line-height: 30px">${ cell.value }</div>`;
        }).join('');
        return `<div class="dinglj-table-tr dinglj-${ (++count) % 2 == 0 ? 'even' : 'odd' }" style="display: flex; padding: 5px 0;">${ tdList }</div>`
    }).join('');
}

function fixStyle() {
    let list = getByClass('dinglj-table-tr');
    for (let tr of list) {
        setTrStyle(tr);
    }
    mouseIOEvent(list, (element, event) => {
        element.style.background = context.config.style.table.row.current.background;
        element.style.color = context.config.style.table.row.current.color;
        let ticketElement = getChildrenByClassName(element, `dinglj-column-data-${ context.config.columns.id.en }`)[0];
        ticketElement.children[1].style.color = context.config.style.table.row.current.color;
    }, (element, event) => {
        let ticketElement = getChildrenByClassName(element, `dinglj-column-data-${ context.config.columns.id.en }`)[0];
        ticketElement.children[1].style.color = context.config.style.table.row.ticketIdColor;
        setTrStyle(element);
    });
    for (let head of getByClass('dinglj-table-head')) {
        head.style.background = context.config.style.table.head.background;
        head.style.color = context.config.style.table.head.color;
    }
    // 取第一行即可, 遍历每一列, 设置其属性
    for (let cell of list[0].children) {
        let columnKey = cell.className.replace('dinglj-col-', '').replace('dinglj-column-data-', '');
        let styleConfig = context.config.style.table.column[columnKey];
        if (styleConfig) {
            for (let styleKey of Object.keys(styleConfig)) {
                setStyleByClassName('dinglj-col-' + columnKey, styleKey, styleConfig[styleKey]);
                setStyleByClassName('dinglj-column-data-' + columnKey, styleKey, styleConfig[styleKey]);
            }
        }
    }
    // 概述列, 永远自适应宽度
    let summaryFinalStyle = {
        flex: 1,
        width: '',
        maxWidth: '',
        minWidth: '',
    }
    let summaryClassNames = [ 'dinglj-column-data-' + context.config.columns.summary.en, 'dinglj-col-' + context.config.columns.summary.en ];
    setMultiStyleToMultiClass(summaryClassNames, summaryFinalStyle);
}

/**
 * 设置行本应具有的样式
 * @param {Element} element <div/>
 */
function setTrStyle(element) {
    if (element.classList.contains('dinglj-even')) {
        element.style.background = context.config.style.table.row.even.background;
        element.style.color = context.config.style.table.row.even.color;
    } else if (element.classList.contains('dinglj-odd')) {
        element.style.background = context.config.style.table.row.odd.background;
        element.style.color = context.config.style.table.row.odd.color;
    }
}

function fixTicketHref() {
    for (let ticketIdElement of getByClass(`dinglj-column-data-${ context.config.columns.id.en }`)) {
        ticketIdElement.style.cursor = 'pointer';
        let origin = ticketIdElement.innerText;
        let ticketId = origin.replace('#', '');
        ticketIdElement.innerHTML = `<input type="checkbox" id="dinglj-is-view-${ ticketId }" style="margin-right: 5px"/><span style="color: ${ context.config.style.table.row.ticketIdColor }">${ origin }</span>`;
        ticketIdElement.addEventListener('click', () => {
            getById(`dinglj-is-view-${ ticketId }`).checked = true;
            window.open(`${ context.config.ticketURL }/${ ticketId }`);
        })
    }
}