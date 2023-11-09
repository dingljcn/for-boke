class Case {
    /** 用例名称 */         caseName;
    /** 状态 */             status;
    /** 模块 */             module;
    /** 变更号 */           ticket;
    /** 当前行数 */         currentRow;
    /** 总行数 */           totalRow;
    /** 当前结束的步骤 */   currentStep;
    /** 总步骤 */           totalStep;
    /** 打包版本 */         zip;
    /** 等级 */             level;
    /** 用例路径 */         casePath;
    /** 耗费时间 */         timeCost;
    constructor(origin) {
        if (origin.stats) {
            if (origin.stats == '待发送') {
                this.status = context_003.const.NOTSEND;
            } else if (origin.stats == '结束') {
                if (origin.result == 'TICKET') {
                    this.status = context_003.const.TICKET;
                } else if (origin.result == 'SUCCESS') {
                    this.status = context_003.const.SUCCESS;
                } else if (origin.result == 'ERROR') {
                    this.status = context_003.const.ERROR
                } else {
                    console.error(`未知的状态 {${ origin.stats }}, 结果 {${ origin.result }}, 请联系 dinglj 补充`);
                }
            } else if (origin.stats == '执行中') {
                this.status = context_003.const.RUNNING;
            } else if (origin.stats == '等待资源') {
                this.status = context_003.const.WAITTING;
            } else if (origin.stats == '失败') {
                this.status = context_003.const.FAILED;
            } else if (origin.stats == '已发送') {
                this.status = context_003.const.SENDED;
            } else {
                console.error(`未知的状态 {${ origin.stats }}, 请联系 dinglj 补充`);
            }
        } else {
            if (origin.result == 'TICKET') {
                this.status = context_003.const.TICKET;
            } else if (origin.result == 'SUCCESS') {
                this.status = context_003.const.SUCCESS;
            } else {
                console.error(`未知的结果 {${ origin.result }}, 请联系 dinglj 补充`);
            }
        }
        if (!this.status) { // 没有状态, 打印原始数据
            console.log(origin);
        }
        this.currentRow = parseInt(origin.currentRow || 0);
        this.zip = origin.erpVersion;
        this.level = origin.level || origin.clevel;
        this.module = origin.module;
        this.caseName = origin.testcaseName || origin.testCaseName;
        this.casePath = origin.testcasePath;
        this.totalRow = parseInt(origin.totalRow || 0);
        this.currentStep = parseInt(origin.endStepNum || 0);
        this.totalStep = parseInt(origin.totalStepNum || 0);
        this.timeCost = origin.timeCost;
        let ticket = origin.ticketId || origin.log;
        this.ticket = ticket ? parseInt(ticket) : ticket;
        this.dbType = origin.dbType || '';
    }
}

const context_003 = {
    modules: [],
    versions: [],
    config: {},
    currentFilters: {
        status: [],
        keyword: '',
    },
    dataOfVersion: {},
    const: {
        TICKET: new LangItem('TICKET', '变更中断'),
        FAILED: new LangItem('FAILED', '失败'),
        SUCCESS: new LangItem('SUCCESS', '成功'),
        RUNNING: new LangItem('RUNNING', '执行中'),
        SENDED: new LangItem('SENDED', '已发送'),
        NOTSEND: new LangItem('NOTSEND', '待发送'),
        WAITTING: new LangItem('WAITTING', '等待资源'),
    },
    details: {},
    onPostShow: []
}

async function getResponse_003(urls, prop = {}) {
    for (let url of urls) {
        for (key of Object.keys(prop)) {
            url = `${ url }&${ key }=${ prop[key] }`;
        }
        let response = await axios.get(url);
        if (response.status == 200) {
            return response.data;
        }
    }
}

async function getModules_003() {
    context_003.modules = await getResponse_003(context_003.config.urls.modules);
}

async function getVersions_003() {
    context_003.versions = await getResponse_003(context_003.config.urls.versions);
}

async function getDefaultCases_003() {
    return await getResponse_003(context_003.config.urls.defaultCases);
}

async function getCases_003(erpVersion) {
    return await getResponse_003(context_003.config.urls.cases, {
        'erpVersion': erpVersion
    });
}

async function getOneCaseHistory_003(caseName) {
    return await getResponse_003(context_003.config.urls.cases, {
        'queryName': encodeURI(caseName).replaceAll(/%/g, '%25')
    });
}