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
            await getAllModule();
        } else {
            console.log('当前网址不符合以下匹配规则:');
            console.log(config.matchList);
        }
    };
    document.head.appendChild(utilScript);
}

/** 读取所有模块 */
async function getAllModule() {
    let response = await axios.get(`${ window.location.href }TestCaseServlet?getModule=true`);
    console.log('module response: ');
    console.log(response);
    globalData.modules = response.data.sort((m1, m2) => {
        let i1 = config.you.preferModule.indexOf(m1);
        if (i1 == -1) {
            i1 = 65535;
        }
        let i2 = config.you.preferModule.indexOf(m2);
        if (i2 == -1) {
            i2 = 65535;
        }
        return i1 - i2;
    });
    globalData.modules.unshift('UNIT');
}