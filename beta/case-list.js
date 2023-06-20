/** 用例类型 */
class Case {
    status; module; caseName; // 三个查询条件
    clevel; row; totalRow; dbType; timeCost; ticketID;
    constructor(origin) {
        this.status = origin.result;
        if (!this.status) { //状态不为空, 则把中文转英文
            if (origin.stats == '执行中') {
                this.status = 'RUNNING';
            } else if (origin.stats == '已发送') {
                this.status = 'WAITTING';
            }
        }
        this.module = origin.module;
        this.caseName = origin.testcaseName || origin.testCaseName;
        this.clevel = origin.clevel || origin.level;
        this.row = origin.currentRow;
        this.totalRow = origin.totalRow;
        this.dbType = origin.dbType;
        this.timeCost = origin.timeCost || '-';
        this.ticketID = origin.log || origin.ticketId || 0;
    }
}

const globalData = {
    modules: [],
    history: [],
    versions: [],
    forCurrentVersion: {
        versionName: '-',
        caseList: [],
        module: '',
        animates: [],
        firstCase: null,
        environment: {}
    },
    defaultModule: null
}

function run(config = null) {
    if (config == null) {
        alert('未传入配置项, 脚本终止执行');
        return;
    }
    // 引入通用脚本
    let utilScript = document.createElement('script');
    utilScript.type = 'text/javascript';
    utilScript.src = 'https://dingljcn.github.io/for-boke/beta/utils.js?' + Math.random();
    // 脚本加载完成之后读取开始读配置, 启动脚本
    utilScript.onload = async function() {
        if (isMatch(config)) {
            console.log('传入的配置项: ')
            console.log(config);
            await getAllModule(config);
            await readVersions(config);
            // 没有版本, 不继续执行
            if (!globalData.versions) {
                return;
            }
            await readCases();
        } else {
            console.log('当前网址不符合以下匹配规则:');
            console.log(config.matchList);
        }
    };
    document.head.appendChild(utilScript);
}

/** 读取所有模块 */
async function getAllModule(config) {
    let response = await axios.get(`${ window.location.href }TestCaseServlet?getModule=true`);
    console.log('所有模块: ');
    console.log(response);
    globalData.modules = response.data.sort((m1, m2) => { //把最关注的模块排在前面
        let i1 = config.preferModule.indexOf(m1);
        let i2 = config.preferModule.indexOf(m2);
        i1 = i1 == -1 ? 65535 : i1;
        i2 = i2 == -1 ? 65535 : i2;
        return i1 - i2;
    });
    globalData.modules.unshift('UNIT'); // 单元测试始终在最前面
}

/** 读取历史回归测试版本 */
async function readVersions(config) {
    let response = await axios.get(`${ window.location.href }EVersionServlet`);
    console.log('所有版本: ');
    console.log(response);
    globalData.history = response.data || [];
    globalData.versions = globalData.history.map(i => i.erpVersion);
}

/** 读取某个版本的回归测试 */
async function readCases(versionName = '-') {
    // 记录当前版本
    globalData.forCurrentVersion.versionName = versionName;
    // 清空要显示的用例集合
    globalData.forCurrentVersion.caseList = [];
    if (versionName == '-') {
        let response = await axios.get(`${ window.location.href }TaskEnvironmentServlet?queryEnvAndTask=true`);
        console.log(`读取版本 ${ versionName }: `);
        console.log(response);
        globalData.forCurrentVersion.environment = response.data.taskEnvironments[0];
        for (origin of response.data.testCaseTasks) {
            let myCase = new Case(origin);
            globalData.forCurrentVersion.caseList.push(myCase);
        }
    } else {
        let response = await axios.get(`${ window.location.href }ReportServlet?queryName=&erpVersion=${ versionName }`);
        console.log(`读取版本 ${ versionName }: `);
        console.log(response);
        for (origin of response.data) {
            let myCase = new Case(origin);
            globalData.forCurrentVersion.caseList.push(myCase);
        }
    }
    console.log('解析该版本响应数据之后的列表: ');
    console.log(globalData.forCurrentVersion.caseList);
}