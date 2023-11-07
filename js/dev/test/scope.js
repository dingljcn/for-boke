export const context_004 = {
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

/** 获取启用的字段名称 */
export function getFieldsFilter() {
    return Array.from(new Set(getByClass('dinglj-filter-column changeable active').map(e => e.children[1].innerHTML)));
}

/** 添加删除标识 */
export function addDeleteIcon(list = []) {
    list.forEach(e => {
        e.innerHTML = `<div class="dinglj-delete" title="移除该属主" onclick="parentNode.remove(); invokeRefresh_004();">×</div>${ e.innerHTML }`
    });
}

/** 获取属主的过滤条件 */
export function getOwnerFilters() {
    return getByClass('dinglj-owner-filter-selector').map(ele => ele.children[1].innerText);
}

/** 把所有变更的某个字段值封装为数组返回 */
export function getTicketFieldValues(field = 'component') {
    return Array.from(new Set(context_004.rt.tickets.map(t => t[field])));
}

/** 字符串转换为 uuid, 并保存两者对应关系 */
export function encodeUID(m) {
    let result = context_004.rt.encodeUID[m];
    if (result) {
        return result;
    } else {
        result = uuid();
        context_004.rt.encodeUID[m] = result;
        context_004.rt.decodeUID[result] = m;
        return result;
    }
}

/** 从 uuid 还原到 map */
export function decodeUID(m) {
    return context_004.rt.decodeUID[m];
}

export function onTableCheckAll(tableKey) {
    let checkAll = getById(`check-all-${ tableKey }`);
    getByClass(`check-${ tableKey }`).forEach(ele => ele.checked = checkAll.checked);
}

export function addNewOwner() {
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

export function onFieldsChange_004(ele, fieldName) {
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

export function toPrev_004(ele) {
    prepareExchange(ele.parentNode, -1);
}

export function toNext_004(ele) {
    prepareExchange(ele.parentNode, 1);
}

export function prepareExchange(currentElement, step = 1) {
    let even = window.event || arguments.callee.caller.arguments[0];
    even.preventDefault();
    even.stopPropagation();
    let list = getByClass('dinglj-filter-column changeable');
    let thisIdx = list.indexOf(currentElement);
    let nextIdx = (thisIdx + step + list.length) % list.length;
    exchange(currentElement, list[nextIdx]);
}

export function exchange(element1, element2){
    let newNode = document.createElement('div');
    let parentNode = element1.parentNode;
    parentNode.insertBefore(newNode, element2);
    parentNode.insertBefore(element2, element1);
    parentNode.insertBefore(element1, newNode);
    parentNode.removeChild(newNode);
    invokeRefresh_004();
}
