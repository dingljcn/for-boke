class Cell {
    key; name; value;
    /**
     * 
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
        return this.cells.filter(cell => cell.key == cellKey)[0];
    }
    get(cellKey) {
        return this.findCell(cellKey).value;
    }
}

class GroupStratege {
    columnKey; expectValue; groupName; resolve;
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
        if (this.resolve != null) {
            return this.resolve(ticket, value);
        }
        return this.expectValue.includes(value);
    }
}

const context = {
    config: {},
    columns: [],
    groups: {},
    groupNames: [],
    groupNameIdMap: {},
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
        })
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
    getById('main')
    let menus = context.groupNames.map(groupName => {
        let groupId = uuid('group');
        context.groupNameIdMap[groupName] = groupId;
        return `<div style="padding: 10px; margin: 5px; border-radius: 5px;" class="dinglj-nav-group-item" id=${ groupId }>${ groupName }</div>`
    }).join('');
    document.getElementById('main').innerHTML = `<div style="display: flex; margin: 30px 0">
        <div id="dinglj-nav-container" style="width: ${ context.config.style.guide.width }; min-width: ${ context.config.style.guide.width }; padding: 10px">
            ${ menus }
        </div>
        <div id="dinglj-view-area" style="flex: 1"></div>
    </div>`;
    let navItems = getByClass('dinglj-nav-group-item');
    listActiveChange(navItems, {
        boxShadow: '0 0 10px -3px grey',
        backgroundColor: context.config.style.guide.active.background,
        color: context.config.style.guide.active.color,
        fontWeight: 'bold',
    }, {
        boxShadow: 'none',
        backgroundColor: context.config.style.guide.inActive.background,
        color: context.config.style.guide.inActive.color,
        fontWeight: 'normal',
    }, (element, event) => {
        console.log('切换目录: ' + element.innerText);
    })
}