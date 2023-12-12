export class DataFilter {
    groupRegExp; tabRegExp; ignoreColumns; func; isRow;
    /** 返回 true 表示是要过滤掉的 */
    exec(groupName, tabName, list, ticket, columnKey = '') {
        if (this.groupRegExp.test(groupName) && this.tabRegExp.test(tabName)) {
            if (this.func) {
                if (this.isRow) {
                    return this.func(groupName, tabName, ticket); // 行过滤不要考虑 columnKey
                } else {
                    return this.func(groupName, tabName, list, columnKey); // 列过滤要考虑 columnKey
                }
            } else {
                if (!this.isRow) {
                    return this.ignoreColumns.includesIgnoreCase(columnKey); // 包含就返回 true, 表示要过滤掉
                }
            }
        }
        return false;
    }
}

/** 行过滤器, 由于还不够精细, 无法提供列过滤器那种数组形式的过滤方式, 只支持传入一个回调函数, 回调函数有三个参数: (groupName, tabName, ticket) */
defunc(window, 'RowFilter', (groupRegExp, tabRegExp, func) => {
    let result = new DataFilter();
    result.isRow = true;
    result.groupRegExp = groupRegExp;
    result.tabRegExp = tabRegExp;
    result.func = func;
    return result;
});

defunc(window, 'ColFilter', (groupRegExp, tabRegExp, arg) => {
    let result = new DataFilter();
    result.isRow = false;
    result.groupRegExp = groupRegExp;
    result.tabRegExp = tabRegExp;
    if (Array.isArray(arg)) {
        result.ignoreColumns = arg;
    } else if (typeof arg == 'function') {
        result.func = arg;
    } else {
        result.ignoreColumns = [ arg ];
    }
    return result;
});