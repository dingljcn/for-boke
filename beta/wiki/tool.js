class Filter {
    regex; column; expectValue; callback;
    constructor(page_regex, table_regex, column_regex, column, expectValue, callback) {
        this.regex = {
            page: page_regex,
            table: table_regex,
            column: column_regex,
        };
        this.column = column;
        this.expectValue = Array.isArray(expectValue) ? expectValue : [ expectValue ];
        this.callback = callback;
    }
    static forColumn(page_regex, table_regex, column_regex, callback) {
        return new Filter(page_regex, table_regex, column_regex, '', [], callback);
    }
    static forRow(page_regex, table_regex, column, expectValue, callback) {
        return new Filter(page_regex, table_regex, /.+/, column, expectValue, callback);
    }
    colFilter(pageName, pageData, tableName, tableData, cellName) {
        if (this.regex.page.test(pageName) && this.regex.table.test(tableName) && this.regex.column.test(cellName)) {
            if (this.callback) {
                return this.callback(pageName, pageData, tableName, tableData, cellName);
            }
            return true;
        }
        return false;
    }
    rowFilter(pageName, pageData, tableName, tableData, idx) {
        if (this.regex.page.test(pageName) && this.regex.table.test(tableName)) {
            if (!this.column) {
                alert('行过滤器中的 column 字段不能为空');
            }
            let cellData = tableData[idx][this.column];
            if (this.callback) {
                return this.callback(pageName, pageData, tableName, tableData, idx, this.column, cellData);
            }
            return this.expectValue.includes(cellData);
        }
        return false;
    }
}

class Order {
    regex; column; order; callback;
    constructor(page_regex, table_regex, column, order, callback) {
        this.regex = {
            page: page_regex,
            table: table_regex,
        };
        this.column = column;
        this.order = Array.isArray(order) ? order : [ order ];
        this.callback = callback;
    }
    resolve(pageName, pageData, tableName, tableData, ticket1, ticket2) {
        if (this.regex.page.test(pageName) && this.regex.table.test(tableName)) {
            if (this.callback) {
                let n1 = this.callback(pageName, pageData, tableName, tableData, ticket2);
                let n2 = this.callback(pageName, pageData, tableName, tableData, ticket1);
                return n1 - n2;
            } else {
                let n1 = this.order.indexOf(ticket1[this.column]);
                let n2 = this.order.indexOf(ticket2[this.column]);
                return n1 - n2;
            }
        }
        return 0;
    }
}

class WikiTicket {

    static withA = /<td.*><a.*>(.*)<\/a><\/td>/;
    static withSpan = /<td.*><span.*>(.*)<\/span><\/td>/;
    static simpleTd = /<td.*>(.*)<\/td>/;

    id;summary;owner;status;reporter;type;priority;component;resolution;time;changetime;plandate;pingtai;project;ticketclass;testadjust;testreport;testower1;keywords;cc;

    static getInstance(element) {
        let data = element.split('\n');
        let instance = new WikiTicket();
        instance.id = WikiTicket.withA.exec(data[0])[1],
        instance.summary = WikiTicket.withA.exec(data[1])[1],
        instance.owner = WikiTicket.withSpan.exec(data[2])[1],
        instance.status = WikiTicket.simpleTd.exec(data[3])[1],
        instance.reporter = WikiTicket.withSpan.exec(data[4])[1],
        instance.type = WikiTicket.simpleTd.exec(data[5])[1],
        instance.priority = WikiTicket.simpleTd.exec(data[6])[1],
        instance.component = WikiTicket.simpleTd.exec(data[7])[1],
        instance.resolution = WikiTicket.simpleTd.exec(data[8])[1],
        instance.time = WikiTicket.withA.exec(data[9])[1],
        instance.changetime = WikiTicket.withA.exec(data[10])[1],
        instance.plandate = WikiTicket.simpleTd.exec(data[11])[1],
        instance.pingtai = WikiTicket.simpleTd.exec(data[12])[1],
        instance.project = WikiTicket.simpleTd.exec(data[13])[1],
        instance.ticketclass = WikiTicket.simpleTd.exec(data[14])[1],
        instance.testadjust = WikiTicket.simpleTd.exec(data[15])[1],
        instance.testreport = WikiTicket.simpleTd.exec(data[16])[1],
        instance.testower1 = WikiTicket.simpleTd.exec(data[17])[1],
        instance.keywords = WikiTicket.simpleTd.exec(data[18])[1],
        instance.cc = WikiTicket.simpleTd.exec(data[19])[1]
        return instance;
    }
}

const context_002 = {
    list: {
        notResolve: {
            name: '需要处理',
            data: {},
            defaultMakeTab: (list = []) => { // return: { tabName, List<Ticket> }
                let result = {
                    '所有': []
                };
                for (let element of list) {
                    let component = element.component; // 以模块进行分组
                    let array = result[component];
                    if (!array) {
                        array = [];
                        result[component] = array;
                    }
                    array.push(element);
                    result['所有'].push(element);
                }
                return result;
            }
        },
        myTickets: {
            name: '我的所有变更',
            data: {},
            defaultMakeTab: (list = []) => { // return: { tabName, List<Ticket> }
                let result = {};
                for (let element of list) {
                    let reporter = element.reporter; // 以报告人进行分组
                    let array = result[reporter];
                    if (!array) {
                        array = [];
                        result[reporter] = array;
                    }
                    array.push(element);
                }
                return result;
            }
        },
        iReport: {
            name: '我提出的变更',
            data: {},
            defaultMakeTab: (list = []) => { // return: { tabName, List<Ticket> }
                let result = {};
                for (let element of list) {
                    let owner = element.owner; // 以属主进行分组
                    let array = result[owner];
                    if (!array) {
                        array = [];
                        result[owner] = array;
                    }
                    array.push(element);
                }
                return result;
            }
        },
    },
    source: [], // 我的所有变更都存储在这里
    runtime: {
        realActive: '',
        activePage: () => context_002.runtime.realActive || (context_002.runtime.realActive = getPageNames()[0]),
    },
    config: {
        css: ''
    },
    waitting: true,
    presist: {
        isAutoExpand: false,
        todo: [],
        finish: [],
        import: [],
    },
    minimap: {},
    statistic: {
        today: new Date(),
        todayList: [],
        weekList: [],
        monthList: [],
        yearList: [],
    }
}

function readCache_002() {
    let string = localStorage.getItem('dinglj-script-002');
    if (string) {
        context_002.presist = JSON.parse(string);
        logln('缓存: ', context_002.presist);
    }
}

function saveCache_002() {
    localStorage.setItem('dinglj-script-002', JSON.stringify(context_002.presist));
}

function getPageNames() {
    let originNames = Object.keys(context_002.list);
    let displayNames = [];
    for (let name of originNames) {
        let flag = true;
        for (let regex of context_002.config.page.ignore) {
            if (regex.test(name)) {
                flag = false;
                break;
            }
        }
        if (flag) {
            displayNames.push(name);
        }
    }
    displayNames.sort((name1, name2) => {
        let idx1 = context_002.config.page.order.indexOf(name1);
        idx1 = idx1 == -1 ? 999999 : idx1;
        let idx2 = context_002.config.page.order.indexOf(name2);
        idx2 = idx2 == -1 ? 999999 : idx2;
        if (idx1 == idx2) {
            return name1 < name2 ? -1 : 1;
        }
        return idx1 - idx2;
    });
    return displayNames;
}

function getTableNames(pageName) {
    let originNames = Object.keys(context_002.list[pageName].data);
    let displayNames = [];
    for (let name of originNames) {
        let flag = true;
        for (let regex of ((context_002.config.table.ignore[pageName]) || ([]))) {
            if (regex.test(name)) {
                flag = false;
                break;
            }
        }
        if (flag) {
            displayNames.push(name);
        }
    }
    displayNames.sort((name1, name2) => {
        let idx1 = ((context_002.config.table.order[pageName]) || ([])).indexOf(name1);
        idx1 = idx1 == -1 ? 999999 : idx1;
        let idx2 = ((context_002.config.table.order[pageName]) || ([])).indexOf(name2);
        idx2 = idx2 == -1 ? 999999 : idx2;
        if (idx1 == idx2) {
            return name1 < name2 ? -1 : 1;
        }
        return idx1 - idx2;
    });
    return displayNames;
}
