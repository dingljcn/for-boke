export class TabStrategy {
    groupRegExp; fieldKey; expectValue; tabName; reverse; func;
    /** 返回 tab 页名称 */
    exec(groupName, ticket) {
        let isMatch = this.groupRegExp.test(groupName);
        if (this.reverse) {
            isMatch = !isMatch;
        }
        if (isMatch) {
            if (this.func) {
                return this.func(groupName, ticket);
            } else if (this.expectValue.includesIgnoreCase(ticket[this.fieldKey])) {
                return this.tabName;
            }
        }
        return '';
    }
}

defunc(window, 'TabPageStrategy', (groupRegExp, fieldKey, expectValue, tabName) => {
    return TabPageStrategy(groupRegExp, fieldKey, expectValue, tabName, false);
});

defunc(window, 'TabPageStrategy', (groupRegExp, fieldKey, expectValue, tabName, reverse) => {
    const result = new TabStrategy();
    result.groupRegExp = groupRegExp;
    result.fieldKey = fieldKey;
    result.tabName = tabName;
    result.reverse = reverse;
    if (Array.isArray(expectValue)) {
        result.expectValue = expectValue;
    } else {
        result.expectValue = [ expectValue ];
    }
    return result;
});

defunc(window, 'TabPageStrategy', (groupRegExp, func) => {
    return TabPageStrategy(groupRegExp, func, false);
});

defunc(window, 'TabPageStrategy', (groupRegExp, func, reverse) => {
    const result = new TabStrategy();
    result.groupRegExp = groupRegExp;
    result.func = func;
    result.reverse = reverse;
    return result;
});