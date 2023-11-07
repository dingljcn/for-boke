import '../extension.js';
import './register.js';
import { addCssLink, generateSelect, groupBy, parseJson, stringify } from '../global.js';
import { LangItem } from '../entities/LangItem.js';
import { encodeUID, getTicketFieldValues } from './scope.js';

addCssLink('https://dingljcn.github.io/for-boke/js/dev/test/index.css');
context_004.config = configBuilder_004();
beforeLoadData_004();
await loadRptData_004();
readTickets_004();
drawFilter();
invokeRefresh_004();

/** 加载数据前, 修改标题, 优化界面显示 */
function beforeLoadData_004() {
    for (let i = 0; i < document.head.children.length; i++) {
        if (document.head.children[i].tagName == 'TITLE') {
            document.head.children[i].innerText = '回归测试变更 - by dinglj';
            break;
        }
    }
}

/** 请求数据 */
async function loadRptData_004() {
    let htmlText = await $.get(context_004.config.report_url);
    htmlText = htmlText.substring(htmlText.indexOf('<div id="banner">'), htmlText.indexOf('</body>') + '</body>'.length);
    htmlText = htmlText.replaceAll(/id="/g, 'id="dinglj-rpt-');
    getById('main').innerHTML = `
        <div id="dinglj-hidden-blocks" style="display: none">${ htmlText }</div>
        <div id="dinglj-filter"></div>
        <div id="dinglj-main"></div>
    `
}

/** 解析数据 */
function readTickets_004() {
    let func = (list) => {
        for (let i = 0; i < list.length; i++) {
            let trData = list[i].innerText.replaceAll(/\n\s*/g, '\n');
            let cells = trData.split('\n').map(c => c.trim()).filter(c => c != '');
            let object = {};
            for (let j = 0; j < cells.length; j++) {
                object[context_004.fields.origin[j]] = cells[j];
            }
            context_004.rt.tickets.push(object);
        }
    }
    func($('.even'));
    func($('.odd'));
}

/** 绘制界面上的过滤条件 */
function drawFilter() {
    /********************** 模块过滤器 ************************/
    let components = getTicketFieldValues('component');
    /********************** 显示方式切换 ************************/
    let modeList = [new LangItem('nav', '导航显示'), new LangItem('tab', '分页显示'), new LangItem('noti', '分栏显示')];
    /********************** 分组方式切换 ************************/
    let groupByMethods =  context_004.fields.zhCN.filter(n => !(['变更号', '概述', '修改时间'].includes(n))); // 不允许以这几个进行分组, 因为可分组性太低了, 基本上都是唯一的
    let groupBy = generateSelect('dinglj-filter-group-by', groupByMethods, {
        callback: 'onGroupByChange',
        defaultValue: '模块'
    });
    /********************** 界面绘制 ************************/
    $('#dinglj-filter')[0].innerHTML = `
    <div class="filter-line">
        <div class="filter-name">分组模式: </div>
        <div class="filter-value">${ groupBy }</div>
    </div>
    <div class="filter-line">
        <div class="filter-name">属主: </div>
        <div class="filter-value">
            <div class="dinglj-btn" id="add-new-owner-filter" onclick="addNewOwner()">添加属主</div>
        </div>
    </div>
    <div class="filter-line">
        <div class="filter-name">显示模式: </div>
        ${ modeList.map(mode => `<div class="dinglj-filter-mode ${ context_004.config.filter.defaultMode == mode.zh ? 'active' : '' }" id="mode-${ mode.en }" onclick="doChangeMode('mode-${ mode.en }')">${ mode.zh }</div>`).join('') }
    </div>
    <div class="filter-line">
        <div class="filter-name">模块: </div>
        ${ components.map(comp => `<div class="dinglj-filter-component" id="comp-${ comp }" onclick="doSelectComponents('comp-${ comp }')">${ comp }</div>`).join('') }
    </div>
    <div class="filter-line">
        <div class="filter-name">字段顺序: </div>
        ${ context_004.fields.zhCN.map(f => `<div class="dinglj-filter-column ${ f == '变更号' ? 'active' : 'changeable' }" id="filter-field-${ f }" onclick="onFieldsChange_004(this, '${ f }')">
            ${ f == '变更号' ? '' : '<span class="change-order to-prev" title="向前移动" onclick="toPrev_004(this)">←</span>' }
            <span>${ f }</span>
            ${ f == '变更号' ? '' : '<span class="change-order to-next" title="向后移动" onclick="toNext_004(this)">→</span>' }
        </div>`).join('') }
    </div>
    `
}

/** 刷新界面数据 */
export function refreshTickets_004(ownerList = [], components = [], mode = '导航显示', groupByName = '模块') {
    console.log(`显示模式: ${ mode }`);
    let data = parseJson(stringify(context_004.rt.tickets));
    /************************** 组件过滤 *********************/
    if (components.length > 0) {
        data = data.filter(t => components.includes(t.component));
    }
    /************************** 属主过滤 *********************/
    let ownerNames = getTicketFieldValues('owner');
    ownerList = ownerList.filter(name => ownerNames.includes(name)); // 先把条件中不存在的名称过滤掉
    if (ownerList.length > 0) {
        data = data.filter(t => ownerList.includes(t.owner)); // 正式对输入进行过滤
    }
    /************************** 分组 *********************/
    let groupIdx = context_004.fields.zhCN.indexOf(groupByName);
    let groupField = context_004.fields.display[groupIdx];
    data = groupBy(data, groupField);
    /************************** 显示 *********************/
    switch (mode) {
        case '导航显示': displayTickets_NavigatorMode(data); break;
        case '分页显示': break;
        case '分栏显示': break;
    }
}

/** 导航显示 */
function displayTickets_NavigatorMode(data) {
    let navHTML = '';
    let keyList = Object.keys(data);
    for (let i = 0; i < keyList.length; i++) {
        let m = keyList[i];
        navHTML += `<div class="dinglj-nav-item" onclick="onNavChange_004('${ m }', '${ encodeUID(m) }')" id="mode-${ encodeUID(m) }">
            <div class="nav-name">${ m }(${ data[m].length })</div>
            <div class="nav-mask"></div>
        </div>`;
    }
    getById('dinglj-main').innerHTML = `<div id="dinglj-navigator-display-mode">
        <div id="dinglj-navigator">${ navHTML }</div>
        <div id="ticket-list-view"></div>
    </div>`;
    context_004.rt.filteredData = data;
    let navigators = getByClass('dinglj-nav-item');
    if (navigators && navigators.length > 0) {
        let array = navigators.filter(e => e.innerText.includes(context_004.rt.lastNav));
        if (array.length == 1) {
            array[0].click();
        } else {
            navigators[0].click();;
        }
    }
}

/** 生成 Table */
export function generateTable_004(tableKey = '', list = []) {
    if (list.length == 0) {
        return '';
    }
    let selectedFields = getFieldsFilter();
    let finalDisplayFields = ['变更号'];
    if (selectedFields && selectedFields.length > 0) {
        finalDisplayFields.push(...selectedFields);
    } else {
        selectedFields = Array.from(new Set(getByClass('dinglj-filter-column changeable').map(e => e.children[1].innerHTML)));
        finalDisplayFields.push(...selectedFields);
    }
    let thead = generateTableHead_004(tableKey, finalDisplayFields);
    let tbody = generateTableData_004(tableKey, finalDisplayFields, list);
    return `<div id="table-of-${ tableKey }" class="dinglj-table-container">${ thead }${ tbody }</div>`;
}

/** 生成表头 */
function generateTableHead_004(tableKey = '', finalDisplayFields) {
    let html = `<div class="dinglj-cell dinglj-column-id">
        <input id="check-all-${ tableKey }" type="checkbox" style="margin-right: 20px" onclick="onTableCheckAll('${ tableKey }')"/>
        <div>变更号</div>
    </div>`;
    for (let i = 1; i < finalDisplayFields.length; i++) {
        let zhIdx = context_004.fields.zhCN.indexOf(finalDisplayFields[i]);
        let key = context_004.fields.display[zhIdx];
        let caption = context_004.fields.zhCN[zhIdx];
        html += `<div class="dinglj-cell dinglj-column-${ key }">${ caption }</div>`
    }
    return `<div class="dinglj-tr dinglj-thead">${ html }</div>`;
}

/** 生成表体 */
function generateTableData_004(tableKey = '', finalDisplayFields, list) {
    let html = [];
    for (let line of list) {
        let ticketID = /.*#(\d+).*/.exec(line.id)[1];
        let lineHTML = `<div class="dinglj-cell dinglj-column-id">
            <input class="check-${ tableKey }" id="check-${ ticketID }" type="checkbox"/>
            <div onclick="getById('check-${ ticketID }').checked = true; window.open('${ context_004.config.ticket_url }/${ ticketID }');">${ line.id }</div>
        </div>`;
        for (let i = 1; i < finalDisplayFields.length; i++) {
            let zhIdx = context_004.fields.zhCN.indexOf(finalDisplayFields[i]);
            let key = context_004.fields.display[zhIdx];
            lineHTML += `<div class="dinglj-cell dinglj-column-${ key }">${ 
                key == 'summary'
                    ? `<div class="dinglj-summary-text">${ line[key] }</div>
                        <div class="ticket-menu" id="menu-for-${ ticketID }">
                            <div class="menu-item" onclick="getById('check-${ ticketID }').checked = true; window.open('${ context_004.config.ticket_url }/${ ticketID }');">打开变更</div>
                            <div class="menu-item" onclick="copyText('#${ ticketID } ${ line.status } ${ line.summary }')">复制描述</div>
                            <div class="menu-item" onclick="copyText('${ context_004.config.ticket_url }/${ ticketID }')">复制链接</div>
                        </div>`
                    : line[key]
            }</div>`;
        }
        html.push(`<div class="dinglj-tr dinglj-data">${ lineHTML }</div>`);
    }
    return `<div class="dinglj-tdata">${ html.join('') }</div>`;
}