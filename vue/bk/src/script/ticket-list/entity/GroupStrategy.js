export class GroupStrategy {
    fieldKey; expectValue; groupName; func;
    exec(ticket, fieldKey) {
        if (this.func) {
            return this.func(ticket, fieldKey);
        } else if (this.fieldKey == fieldKey && this.expectValue.includesIgnoreCase(ticket[fieldKey])) {
            return this.groupName;
        }
        return '';
    }
}

defunc(window, 'GroupStrategy', (fieldKey, expectValue, groupName) => {
    let result = new GroupStrategy();
    result.fieldKey = fieldKey;
    result.expectValue = expectValue;
    result.groupName = groupName;
    if (Array.isArray(expectValue)) {
        result.expectValue = expectValue;
    } else {
        result.expectValue = [ expectValue ];
    }
    return result;
});

defunc(window, 'GroupStrategy', func => {
    let result = new GroupStrategy();
    result.func = func;
    return result;
})