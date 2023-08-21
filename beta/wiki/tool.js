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
    }
}

class Ignore02 {
    regex; callback; scope;
    constructor(page_regex, table_regex, column_regex, value_regex, scope, callback) {
        this.regex = {
            page: page_regex,
            table: table_regex,
            column: column_regex,
            value: value_regex,
        };
        this.scope = scope;
        this.callback = callback;
    }
    static forPage(page_regex, callback) {
        return new Ignore02(page_regex, /^$/, /^$/, /^$/, 'page', callback);
    }
    static forTable(page_regex, table_regex, callback) {
        return new Ignore02(page_regex, table_regex, /^$/, /^$/, 'table', callback);
    }
    static forColumn(page_regex, table_regex, column_regex, callback) {
        return new Ignore02(page_regex, table_regex, column_regex, /^$/, 'column', callback);
    }
    static forRow(page_regex, table_regex, column_regex, value_regex, callback) {
        return new Ignore02(page_regex, table_regex, column_regex, value_regex, 'row', callback);
    }
    resolve(pageName, pageData, tableName, tableData, cellName, cellData) {
        if (!this.regex.page.test(pageName)) { // 页名不符合, 返回 false
            return false;
        }
        if (this.scope == 'page') { // 只检查页
            if (this.callback) {
                return this.callback(pageName, pageData); // 回调存在, 按回调结果返回
            }
            return true; // 否则直接返回 true
        }
        if (!this.regex.table.test(tableName)) { // 表名不符合, 返回 false
            return false;
        }
        if (this.scope == 'table') {
            if (this.callback) {
                return this.callback(pageName, pageData, tableName, tableData); // 回调存在, 按回调结果返回
            }
            return true;
        }
        if (!this.regex.column.test(cellName)) { // 列名不符合, 返回 false
            return false;
        }
        if (this.scope == 'column') {
            if (this.callback) {
                return this.callback(pageName, pageData, tableName, tableData, cellName, cellData); // 回调存在, 按回调结果返回
            }
            return true;
        }
        if (!this.regex.value.test(cellData)) { // 数据不符合, 返回 false
            return false;
        }
        if (this.scope == 'row') {
            if (this.callback) {
                return this.callback(pageName, pageData, tableName, tableData, cellName, cellData); // 回调存在, 按回调结果返回
            }
            return true;
        }
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

function readCache_002() {
    let string = localStorage.getItem('dinglj-script-002');
    if (string) {
        context_002.presist = JSON.parse(string);
    }
}

function saveCache_002() {
    localStorage.setItem('dinglj-script-002', JSON.stringify(context_002.presist));
}