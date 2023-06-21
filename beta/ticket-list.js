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

const context = {
    config: {},
    columns: [],
    groups: {},
    groupNames: [],
    groupNameIdMap: {},
    tabPathIdMap: {},
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
        return `<div style="transition: 0.4s; padding: 10px; margin: 5px; border-radius: 5px; position: relative; overflow: hidden" class="dinglj-nav-group-item" id=${ groupId }>
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
            <div id="dinglj-tab-view" style="overflow-x: hidden">
                <div id="dinglj-ticket-view"></div>
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
    // 显示变更区域的宽度
    let containerWidth = getById('dinglj-tab-view').offsetWidth;
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
    });
}

/** 绘制 */
function drawTabPage(groupName, containerWidth, tabStrateges) {

}