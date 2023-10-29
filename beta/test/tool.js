const context_004 = {
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
function getFieldsFilter() {
    return Array.from(new Set(getByClass('dinglj-filter-column changeable active').map(e => e.children[1].innerHTML)));
}
/** 选择了组件, 如果已经激活, 则取消激活, 未激活则激活 */
function doSelectComponents(id) {
    let element = getById(id);
    if (element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
    invokeRefresh_004();
}

function addDeleteIcon(list = []) {
    list.forEach(e => {
        e.innerHTML = `<div class="dinglj-delete" title="移除该属主" onclick="parentNode.remove(); invokeRefresh_004();">×</div>${ e.innerHTML }`
    });
}

function getOwnerFilters() {
    return getByClass('dinglj-owner-filter-selector').map(ele => ele.children[1].innerText);
}

function invokeRefresh_004() {
    let components = getByClass('dinglj-filter-component active').map(ele => ele.innerText.trim());
    let displayMode = getByClass('dinglj-filter-mode active')[0].innerText.trim();
    let groupBy = getSelectValue('dinglj-filter-group-by');
    let owners = getOwnerFilters();
    refreshTickets_004(owners, components, displayMode, groupBy);
}

function doChangeMode(id) {
    getByClass('dinglj-filter-mode active')[0].classList.remove('active');
    getById(id).classList.add('active');
    invokeRefresh_004();
}

function onOwnerFilterChange(value) {
    invokeRefresh_004();
}

function onGroupByChange(value) {
    invokeRefresh_004();
}

function getTicketFieldValues(field = 'component') {
    return Array.from(new Set(context_004.rt.tickets.map(t => t[field])));
}

function onNavChange_004(nav, name) {
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

function encodeUID(m) {
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

function decodeUID(m) {
    return context_004.rt.decodeUID[m];
}

function onTableCheckAll(tableKey) {
    let checkAll = getById(`check-all-${ tableKey }`);
    getByClass(`check-${ tableKey }`).forEach(ele => ele.checked = checkAll.checked);
}

function addNewOwner() {
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

function onFieldsChange_004(ele, fieldName) {
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

function toPrev_004(ele) {
    prepareExchange(ele.parentNode, -1);
}

function toNext_004(ele) {
    prepareExchange(ele.parentNode, 1);
}

function prepareExchange(currentElement, step = 1) {
    let even = window.event || arguments.callee.caller.arguments[0];
    even.preventDefault();
    even.stopPropagation();
    let list = getByClass('dinglj-filter-column changeable');
    let thisIdx = list.indexOf(currentElement);
    let nextIdx = (thisIdx + step + list.length) % list.length;
    exchange(currentElement, list[nextIdx]);
}

function exchange(element1, element2){
    let newNode = document.createElement('div');
    let parentNode = element1.parentNode;
    parentNode.insertBefore(newNode, element2);
    parentNode.insertBefore(element2, element1);
    parentNode.insertBefore(element1, newNode);
    parentNode.removeChild(newNode);
    invokeRefresh_004();
}
