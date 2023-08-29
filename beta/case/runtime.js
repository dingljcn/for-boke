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
        if (origin.stats == '待发送') {
            this.status = context_003.const.NOTSEND;
        } else if (origin.stats == '结束') {
            if (origin.result == 'TICKET') {
                this.status = context_003.const.TICKET;
            } else if (origin.result == 'SUCCESS') {
                this.status = context_003.const.SUCCESS;
            }
        } else if (origin.stats == '执行中') {
            this.status = context_003.const.RUNNING;
        }
        this.currentRow = origin.currentRow;
        this.zip = origin.erpVersion;
        this.level = origin.level || origin.clevel;
        this.module = origin.module;
        this.caseName = origin.testcaseName || origin.testCaseName;
        this.casePath = origin.testcasePath;
        this.totalRow = origin.totalRow;
        this.currentStep = origin.endStepNum;
        this.totalStep = origin.totalStepNum;
        this.timeCost = origin.timeCost;
        this.ticket = origin.ticketId;
    }
    parseStatus(status) {
        switch(status) {
            case '待发送': return context_003.const.NOTSEND;
            case '执行中': return context_003.const.RUNNING;
            case '待成功发送': return context_003.const.SUCCESS;
            case '变更中断': return context_003.const.TICKET;
            default: return new LangItem('UNKNOW', '未知状态');
        }
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
        NOTSEND: new LangItem('NOTSEND', '待发送'),
        SUCCESS: new LangItem('SUCCESS', '成功'),
        RUNNING: new LangItem('RUNNING', '执行中'),
        TICKET: new LangItem('TICKET', '变更中断'),
    }
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