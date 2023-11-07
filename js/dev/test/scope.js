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

/** 交换顺序事件 */
export function prepareExchange(currentElement, step = 1) {
    let even = window.event || arguments.callee.caller.arguments[0];
    even.preventDefault();
    even.stopPropagation();
    let list = getByClass('dinglj-filter-column changeable');
    let thisIdx = list.indexOf(currentElement);
    let nextIdx = (thisIdx + step + list.length) % list.length;
    exchange(currentElement, list[nextIdx]);
}

/** 交换顺序事件 */
export function exchange(element1, element2){
    let newNode = document.createElement('div');
    let parentNode = element1.parentNode;
    parentNode.insertBefore(newNode, element2);
    parentNode.insertBefore(element2, element1);
    parentNode.insertBefore(element1, newNode);
    parentNode.removeChild(newNode);
    invokeRefresh_004();
}

