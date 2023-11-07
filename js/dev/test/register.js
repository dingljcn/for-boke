import { generateTable_004, refreshTickets_004 } from ".";
import { generateSelect, getSelectValue } from "../global";
import { addDeleteIcon, decodeUID, getOwnerFilters, getTicketFieldValues, prepareExchange } from "./scope";

window.context_004 = {
    config: {},
    rt: {
        tickets: [],
        encodeUID: {},
        decodeUID: {},
        filteredData: [],
        lastNav: '',
    },
    fields: {
        origin: ['id', 'priority', 'owner', 'create_time', 'modify_time', 'from_create', 'to_end', 'component', 'summary', 'status'], /* 变更报表原字段顺序 */
        display: ['id', 'summary', 'status', 'priority', 'component', 'owner', 'create_time', 'modify_time', 'from_create', 'to_end'], /* 要显示的字段顺序 */
        zhCN: ['变更号', '概述', '状态', '优先级', '模块', '属主', '创建时间', '修改时间', '已创建天数', '上次处理天数'], /* 要显示的字段顺序名称 */
    }
}

/** 组件变化事件, 如果已经激活, 则取消激活, 未激活则激活 */
window.doSelectComponents = function(id) {
    let element = getById(id);
    if (element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
    invokeRefresh_004();
}

/** 过滤条件变化事件 */
window.invokeRefresh_004 = function() {
    let components = getByClass('dinglj-filter-component active').map(ele => ele.innerText.trim());
    let displayMode = getByClass('dinglj-filter-mode active')[0].innerText.trim();
    let groupBy = getSelectValue('dinglj-filter-group-by');
    let owners = getOwnerFilters();
    refreshTickets_004(owners, components, displayMode, groupBy);
}

/** 显示方式变化事件 */
window.doChangeMode = function(id) {
    getByClass('dinglj-filter-mode active')[0].classList.remove('active');
    getById(id).classList.add('active');
    invokeRefresh_004();
}

/** 分组的值变化事件 */
window.onGroupByChange = function(value) {
    invokeRefresh_004();
}

/** 属主的值变化事件 */
window.onOwnerFilterChange = function(value) {
    invokeRefresh_004();
}

/** 新增属主事件 */
window.addNewOwner = function() {
    let btnText = '<div class="dinglj-btn" id="add-new-owner-filter" onclick="addNewOwner()">添加属主</div>';
    // 取元素
    let parentNode = getById('add-new-owner-filter').parentNode;
    // 添加元素
    let owners = getTicketFieldValues('owner');
    let size = getByClass('dinglj-owner-filter-selector').length;
    let selectOwner = generateSelect(`dinglj-owner-filter-${ size + 1 }`, owners, {
        callback: 'onOwnerFilterChange',
        className: 'dinglj-owner-filter-selector'
    });
    let insertIdx = parentNode.innerHTML.indexOf(btnText);
    parentNode.innerHTML = parentNode.innerHTML.replace(btnText, selectOwner + btnText);
    let theNewSelect = getById(`dinglj-owner-filter-${ size + 1 }-select-container`);
    addDeleteIcon([theNewSelect]);
}

/** 导航项的点击事件 */
window.onNavChange_004 = function(nav, name) {
    context_004.rt.lastNav = nav;
    let last = getByClass('dinglj-nav-item active-nav');
    if (last && last.length > 0) {
        last.forEach(ele => ele.classList.remove('active-nav'));
    }
    getById(`mode-${ name }`).classList.add('active-nav');
    let key = decodeUID(name);
    let tickets = context_004.rt.filteredData[key];
    getById('ticket-list-view').innerHTML = generateTable_004(name, tickets);
    context_004.fields.display.forEach(key => {
        if (key == 'summary') {
            return;
        }
        let tickets = getByClass(`dinglj-column-${ key }`);
        let widths = tickets.map(ele => ele.offsetWidth);
        let max_width = Math.max(...widths);
        tickets.forEach(ele => ele.style.width = `${ max_width + 20 }px`)
    })
}

/** 字段变化事件 */
window.onFieldsChange_004 = function(ele, fieldName) {
    if (fieldName == '变更号') {
        return;
    }
    if (ele.classList.contains('active')) {
        ele.classList.remove('active');
    } else {
        ele.classList.add('active');
    }
    invokeRefresh_004();
}

/** 表格全选事件 */
window.onTableCheckAll = function(tableKey) {
    let checkAll = getById(`check-all-${ tableKey }`);
    getByClass(`check-${ tableKey }`).forEach(ele => ele.checked = checkAll.checked);
}

/** 字段前移事件 */
window.toPrev_004 = function(ele) {
    prepareExchange(ele.parentNode, -1);
}

/** 字段后移事件 */
window.toNext_004 = function(ele) {
    prepareExchange(ele.parentNode, 1);
}