class Case {
    status; module; caseName;
    clevel; row; totalRow; dbType; timeCost; ticketID;
    constructor(origin) {
        this.status = origin.result;
        if (!this.status) { //状态不为空, 则把中文转英文
            if (origin.stats) {
                if (origin.stats == '执行中') {
                    this.status = 'RUNNING';
                } else if (origin.stats == '已发送') {
                    this.status = 'WAITTING';
                }
            } else if (origin.result != 'SUCESS' && origin.result != 'TICKET' && origin.currentRow == 0) { // 兼容 8888 端口
                this.status = 'RUNNING';
            }
        }
        this.module = origin.module;
        this.caseName = origin.testcaseName || origin.testCaseName;
        this.clevel = origin.clevel || origin.level;
        this.row = (this.status == 'SUCCESS') ? origin.totalRow : origin.currentRow;
        this.totalRow = origin.totalRow;
        this.dbType = origin.dbType;
        this.timeCost = origin.timeCost || '-';
        this.ticketID = origin.log || origin.ticketId || 0;
    }
}

const context_003 = {
    modules: [],
    versions: [],
    config: {},
    currentFilters: {
        status: []
    },
    dataOfVersion: {},
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