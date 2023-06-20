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

/** 用例过滤器 */
class CaseFilter {
    column; type; value;
    constructor(column, type, value) {
        this.column = column;
        this.type = type;
        if (value instanceof Array) {
            this.value = value;
        } else {
            this.value = [ value ];
        }
    }
}

/** 全局数据 */
const context = {
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
    // 由于这些是局域网地址, 故直接写在这里, 也便于更新
    config.matchList = [
        /^http:\/\/1.1.11.22:8084\/autowork\/$/
    ]
    config.database = {
        mysql: 'DB_TYPE=MySQL;DB_SERVER=1.1.8.77:3306;DB_USER=root;DB_PASS=123456;DB_NAME=ticket_',
        oracle: 'DB_TYPE=ORACLE;DB_SERVER=1.1.8.77:1521;DB_NAME=PDBORCL;DB_PASS=123456;DB_USER=ticket_',
        sql: 'DB_TYPE=SQL;DB_SERVER=1.1.8.77:1433;DB_USER=sa;DB_PASS=P@123456,;DB_NAME=ticket_'
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
            if (!context.versions) {
                return;
            }
            await readCases();
            drawGuide(config);
            drawFilter();
            context.defaultModule.click();
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
    context.modules = response.data.sort((m1, m2) => { //把最关注的模块排在前面
        let i1 = config.preferModule.indexOf(m1);
        let i2 = config.preferModule.indexOf(m2);
        i1 = i1 == -1 ? 65535 : i1;
        i2 = i2 == -1 ? 65535 : i2;
        return i1 - i2;
    });
    context.modules.unshift('UNIT'); // 单元测试始终在最前面
}

/** 读取历史回归测试版本 */
async function readVersions(config) {
    let response = await axios.get(`${ window.location.href }EVersionServlet`);
    console.log('所有版本: ');
    console.log(response);
    context.history = response.data || [];
    context.versions = context.history.map(i => i.erpVersion);
}

/** 读取某个版本的回归测试 */
async function readCases(versionName = '-') {
    // 记录当前版本
    context.forCurrentVersion.versionName = versionName;
    // 清空要显示的用例集合
    context.forCurrentVersion.caseList = [];
    if (versionName == '-') {
        let response = await axios.get(`${ window.location.href }TaskEnvironmentServlet?queryEnvAndTask=true`);
        console.log(`读取版本 ${ versionName }: `);
        console.log(response);
        context.forCurrentVersion.environment = response.data.taskEnvironments[0];
        for (origin of response.data.testCaseTasks) {
            let myCase = new Case(origin);
            context.forCurrentVersion.caseList.push(myCase);
        }
    } else {
        let response = await axios.get(`${ window.location.href }ReportServlet?queryName=&erpVersion=${ versionName }`);
        console.log(`读取版本 ${ versionName }: `);
        console.log(response);
        for (origin of response.data) {
            let myCase = new Case(origin);
            context.forCurrentVersion.caseList.push(myCase);
        }
    }
    console.log('解析该版本响应数据之后的列表: ');
    console.log(context.forCurrentVersion.caseList);
}

/** 绘制左侧导航栏 */
function drawGuide(config) {
    document.body.innerHTML = `<div style="display: flex; min-width: 1320px">
        <div id="dinglj-guide" style="width: 150px; padding: 10px; text-align: left"></div>
        <div id="dinglj-main" style="flex: 1; padding: 20px"></div>
    </div>`;
    let guideBox = document.getElementById('dinglj-guide');
    for (let moduleName of context.modules) {
        let element = newElement('div', {
            parentNode: guideBox,
        }, {
            id: `dinglj-guide-${ moduleName }`,
            innerHTML: moduleName
        }, {
            padding: '3px',
            margin: '5px',
            cursor: 'pointer',
            borderRadius: '5px',
            transition: '0.2s',
            display: 'flex',
        })
        element.addEventListener('click', () => {
            let children = guideBox.children;
            for (let i = 0; i < children.length; i++) {
                let moduleDiv = children[i];
                moduleDiv.style.boxShadow = 'none';
                moduleDiv.innerHTML = moduleDiv.innerText;
            }
            let targetDiv = document.getElementById(`dinglj-guide-${ moduleName }`);
            targetDiv.style.boxShadow = `0 0 20px 0px ${ config.style.guide.boxShadowColor }`;
            targetDiv.innerHTML = `<div style="transition: 0.2s; width: 4px; height: 14px; margin-right: 5px; margin-left: 2px; margin-top: 3px; background: ${ config.style.guide.selectIcon }"></div><div>${ moduleName }</div>`
            context.forCurrentVersion.module = moduleName;
            drawCases(config);
        });
        if (moduleName == config.defaultModuleName) {
            context.defaultModule = element;
        }
    }
}

/** 绘制所选模块的用例 */
async function drawCases(config) {
    // filter, 过滤器
    let filter = [
        new CaseFilter('module', 'is', context.forCurrentVersion.module)
    ]
    // 如果当前要查看的版本和以前load的版本不一致, 需要重新 load
    let version = document.getElementById('dinglj-versions').value;
    if (version != context.forCurrentVersion.versionName) {
        await readCases(version);
    }
    // 状态过滤
    let status = document.getElementById('dinglj-status').value;
    if (status) {
        filter.push(new CaseFilter('status', 'is', status));
    }
    // 关键字过滤
    let keyword = document.getElementById('dinglj-keyword').value;
    if (keyword) {
        filter.push(new CaseFilter('caseName', 'like', keyword));
    }
    // 清空显示在界面上的用例
    document.getElementById('dinglj-case-box').innerHTML = '';
    // 清空动画列表
    context.forCurrentVersion.animates = [];
    // 清空第一个用例
    context.forCurrentVersion.firstCase = null;
    // 根据过滤规则过滤
    let caseList = findCase(filter);
    // 对用例进行分组
    let ticketList = [];
    let successList = [];
    let runningList = [];
    let waittingList = [];
    for (let caseData of caseList) {
        if (caseData.status) {
            if (caseData.status == 'TICKET') { // 出现变更
                ticketList.push(caseData);
            } else if (caseData.status == 'SUCCESS') { // 运行成功
                successList.push(caseData);
            } else if (caseData.status == 'RUNNING') { // 正在运行
                runningList.push(caseData);
            } else if (caseData.status == 'WAITTING') { // 等待中
                waittingList.push(caseData);
            }
        }
    }
    // 绘制用例到界面上
    drawList(config, '变更中止', ticketList, false);
    drawList(config, '测试通过', successList, ticketList.length > 0);
    drawList(config, '正在执行', runningList, successList.length > 0 || ticketList.length > 0);
    drawList(config, '等待启动中', waittingList, runningList.length > 0 || successList.length > 0 || ticketList.length > 0);
    // 执行进度动画
    context.forCurrentVersion.animates.forEach(callback => callback());
    // 点击第一个用例
    context.forCurrentVersion.firstCase.click();
    console.log('当前模块的用例数据: ');
    console.log({
        ticket: ticketList,
        success: successList,
        running: runningList,
        waitting: waittingList
    })
}

/** 按照查找配置过滤用例 */
function findCase(filterConfig = []) {
    let result = [];
    for (let caseData of context.forCurrentVersion.caseList) {
        let flag = true;
        for (let strategy of filterConfig) {
            if (strategy.column == 'module' && strategy.value == 'UNIT') { // 单元测试特殊处理
                if (caseData.clevel != 0) { // clevel 为 0 才是单元测试用例
                    flag = false;
                    break;
                }
            } else if (strategy.type == 'is') {
                if (caseData[strategy.column] != strategy.value) {
                    flag = false; ''.includes
                    break;
                }
            } else if (strategy.type == 'like') {
                if (!caseData[strategy.column].includes(strategy.value)) {
                    flag = false; ''.includes
                    break;
                }
            }
        }
        if (flag) {
            result.push(caseData);
        }
    }
    return result;
}

/** 绘制一组用例 */
function drawList(config, banner, list = [], hasPrev) {
    // 没有可以显示的用例, 不显示
    if (list.length == 0) {
        return;
    }
    let box = document.getElementById('dinglj-case-box');
    // 标题
    let title = document.createElement("h2");
    title.innerText = `${ banner }(${ list.length })`;
    title.style.textAlign = 'left';
    title.style.marginLeft = '10px';
    title.style.marginBottom = '10px';
    if (hasPrev) {
        title.style.marginTop = '20px';
    }
    box.appendChild(title);
    // 外层容器
    let container = document.createElement('div');
    container.style.textAlign = 'left';
    box.appendChild(container);
    // 主容器
    let realContainer = document.createElement('div');
    realContainer.style.textAlign = 'left';
    realContainer.style.margin = '0 auto';
    realContainer.style.display = 'inline-block';
    container.appendChild(realContainer);
    // 填充用例信息
    for (let caseData of list) {
        let caseElement = document.createElement('div');
        caseElement.addEventListener('click', () => {
            document.getElementById('dinglj-info-casename').innerText = caseData.caseName;
            document.getElementById('dinglj-info-status').innerText = caseData.status;
            document.getElementById('dinglj-info-level').innerText = caseData.clevel;
            document.getElementById('dinglj-info-row').innerText = caseData.row;
            document.getElementById('dinglj-info-total').innerText = caseData.totalRow;
            document.getElementById('dinglj-info-dbtype').innerText = caseData.dbType;
            document.getElementById('dinglj-info-time-cost').innerText = caseData.timeCost;
            if (caseData.status == 'TICKET') {
                if (caseData.dbType == 'mysql') {
                    document.getElementById('dinglj-info-link').innerText = config.database.mysql + caseData.ticketID;
                } else if (caseData.dbType == 'oracle') {
                    document.getElementById('dinglj-info-link').innerText = config.database.oracle + caseData.ticketID;
                } else if (caseData.dbType == 'sql') {
                    document.getElementById('dinglj-info-link').innerText = config.database.sql + caseData.ticketID;
                }
            } else {
                document.getElementById('dinglj-info-link').innerText = '无变更数据库';
            }
        });
        if (!context.forCurrentVersion.firstCase) {
            context.forCurrentVersion.firstCase = caseElement;
        }
        caseElement.style.display = 'inline-block';
        let elementID = 'dinglj-progress-' + context.forCurrentVersion.animates.length;
        let ticket = '';
        if (caseData.status == 'TICKET') {
            ticket = `<div style="height: 16px; line-height: 16px; display: flex; font-weight: bold; font-size: 12px; padding: 0 10px; margin-bottom: 5px">
                <strong style="margin-right: 5px">
                    <a target="_blank" style="line-height: 16px; font-size: 12px; color: rgb(30, 111, 255); text-decoration-line: none;" href="${ config.ticketURL }/${ caseData.ticketID }">#${ caseData.ticketID }</a>
                </strong>
                <div style="flex: 1"></div>
                <span id="${ elementID }-percent"></span>
            </div>`;
        }
        let progressHTML = '';
        if (caseData.status != 'RUNNING' && caseData.status != 'WAITTING') {
            progressHTML = `<div style="height: 16px; line-height: 16px; display: flex; font-size: 12px; margin: 5px">
                <span id="${ elementID }-row" style="padding: 0 5px">0</span>
                <div style="flex: 1; margin-left: 5px; margin-right: 5px; position: relative;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 5px; margin-top: 6px; background-color: #DDD; border-radius: 2px"></div>
                    <div id="${ elementID }" style="position: absolute; top: 0; left: 0; height: 5px; margin-top: 6px; background-color: #000; border-radius: 2px"></div>
                </div>
                <span style="padding: 0 5px">${ caseData.totalRow }</span>
            </div>`;
            context.forCurrentVersion.animates.push(() => {
                let progress = document.getElementById(elementID);
                let rowNumber = document.getElementById(elementID + '-row');
                let pct = document.getElementById(elementID + '-percent');
                let totalRow = caseData.totalRow;
                let finalRow = caseData.row;
                let step = finalRow / 100;
                let row = 0;
                let timer = setInterval(() => {
                    let totalWidth = progress.parentNode.offsetWidth;
                    row += step;
                    let percent = row / totalRow;
                    progress.style.width = `${ (totalWidth * percent).toFixed(2) }px`;
                    rowNumber.innerText = parseInt(row);
                    if (row > finalRow) {
                        row = finalRow;
                        percent = finalRow / totalRow;
                        progress.style.width = `${ (totalWidth * percent).toFixed(2) }px`
                        rowNumber.innerText = finalRow;
                        clearInterval(timer);
                    }
                    progress.style.backgroundColor = pickColor(percent);
                    if (pct) {
                        pct.innerText = (percent * 100).toFixed(2) + '%';
                    }
                }, 10);
            })
        }
        let timeCostOnSuccess = '';
        if (caseData.status == 'SUCCESS') {
            timeCostOnSuccess = `<span style="white-space:nowrap;">${ caseData.timeCost }</span>`;
        }
        caseElement.innerHTML = `<div style="display: flex; flex-direction: column; width: 250px; margin: 5px; padding: 5px; border-radius: 5px; box-shadow: rgb(205, 205, 205) 0px 0px 8px 0px; display: inline-block; ">
            ${ ticket }
            <div style="height: 16px; line-height: 16px; display: flex; font-weight: bold; font-size: 12px; padding: 0 10px">
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${ caseData.caseName.replace(/\.[xX][lL][sS][xX]?/, '').replace(/^(\d.\d[-_])?/, '').replace('-', '_').trim() }</span>
                <div style="flex: 1"></div>
                ${ timeCostOnSuccess }
            </div>
            ${ progressHTML }
        </div>`;
        realContainer.appendChild(caseElement);
    }
}

/** 用例进度条的颜色 */
function pickColor(percent) {
    percent = percent * 100;
    let color = '';
    switch(parseInt(percent / 10)) {
        case 0: color = '#FE3400'; break;
        case 1: color = '#FE7000'; break;
        case 2: color = '#FFAE00'; break;
        case 3: color = '#FFEC00'; break;
        case 4: color = '#CFD834'; break;
        case 5: color = '#899E7D'; break;
        case 6: color = '#4466C7'; break;
        case 7: color = '#1C53DD'; break;
        case 8: color = '#247BA3'; break;
        case 9: color = '#2CA36A'; break;
        case 10: color = '#34CC31'; break;
    }
    return color;
}

/** 绘制过滤器 */
function drawFilter() {
    let main = document.getElementById('dinglj-main');
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    let statusOptions = '';
    for (let statusName of ['', 'TICKET', 'SUCCESS', 'RUNNING', 'WAITTING']) {
        statusOptions += `<option value="${ statusName }">${ statusName || 'ALL' }</option>`;
    }
    let versionOptions = '<option value="-"> 当前轮次 </option>'
    for (let versionName of context.versions) {
        versionOptions += `<option value="${ versionName }">${ versionName }</option>`;
    }
    main.innerHTML = `<div style="width: 100%; height: 40px; text-align: left">
        <div style="display: inline-block"><div style="display: inline-block;margin: 0 3px">版本</div><select id="dinglj-versions" style="outline: none; border: 1px solid rgb(204,204,204); height: 28px; line-height: 28px; padding: 5px; border-radius: 5px; ">${ versionOptions }</select></div>
        <div style="display: inline-block"><div style="display: inline-block;margin: 0 3px">状态</div><select id="dinglj-status" style="outline: none; border: 1px solid rgb(204,204,204); height: 28px; line-height: 28px; padding: 5px; border-radius: 5px; ">${ statusOptions }</select></div>
        <div style="display: inline-block"><div style="display: inline-block;margin: 0 3px">关键字</div><input id="dinglj-keyword" style="padding: 5px; font-size: 14px; height: 16px; line-height: 16px; outline: none; border-radius: 5px;" id="dinglj-keyword"/></div>
        <div id="dinglj-update" style=" padding: 0 10px; height: 28px; line-height: 28px; outline: none; font-size: 14px; border-radius: 5px; display: inline-block; background: rgb(30, 111, 255); color: white;">更新</div>
    </div>
    <div id="dinglj-info">
        <div style="display: flex">
            <div style="display: flex;">
                <div style="font-weight: bold">用例名称:&nbsp;&nbsp;</div>
                <div id="dinglj-info-casename" style="font-weight: bold"></div>
            </div>
            <div style="display: flex; margin-left: 15px">
                <div style="font-weight: bold">状态:&nbsp;&nbsp;</div>
                <div id="dinglj-info-status" style="font-weight: bold"></div>
            </div>
            <div style="display: flex; margin-left: 15px">
                <div style="font-weight: bold">等级:&nbsp;&nbsp;</div>
                <div id="dinglj-info-level" style="font-weight: bold"></div>
            </div>
            <div style="display: flex; margin-left: 15px">
                <div style="font-weight: bold">当前行数:&nbsp;&nbsp;</div>
                <div id="dinglj-info-row" style="font-weight: bold"></div>
            </div>
            <div style="display: flex; margin-left: 15px">
                <div style="font-weight: bold">总行数:&nbsp;&nbsp;</div>
                <div id="dinglj-info-total" style="font-weight: bold"></div>
            </div>
            <div style="display: flex; margin-left: 15px">
                <div style="font-weight: bold">数据库类型:&nbsp;&nbsp;</div>
                <div id="dinglj-info-dbtype" style="font-weight: bold"></div>
            </div>
            <div style="display: flex; margin-left: 15px">
                <div style="font-weight: bold">耗时:&nbsp;&nbsp;</div>
                <div id="dinglj-info-time-cost" style="font-weight: bold"></div>
            </div>
        </div>
        <br>
        <div style="display: flex;">
            <div style="font-weight: bold">数据库链接:&nbsp;&nbsp;</div>
            <div id="dinglj-info-link" style="cursor: pointer; color: rgb(30, 111, 255); font-weight: bold"></div>
        </div>
    </div>
    <div id="dinglj-case-box" style="margin-top: 20px"></div>`;
    let htmlElement = document.getElementById('dinglj-info-link');
    htmlElement.addEventListener('click', () => {
        copyText(htmlElement.innerText);
    })
    document.getElementById("dinglj-update").addEventListener('click', () => {
        drawCases();
    });
}
