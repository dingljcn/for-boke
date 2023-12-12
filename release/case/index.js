alert('该脚本将于 2024-01-01 彻底删除, 请前往 { 共享文档/工具和脚本/js/vue } 目录, 使用最新的 Vue 版本 { 用例清单 - 脚本.js }, 如有任何技术问题, 请联系 dinglj, 变更报表、截图查看工具等脚本也正在升级成为 Vue 版本, 敬请期待, 谢谢支持!')

function prepare_scripts_003(loadScript, callback) {
    loadScript('utils.js', () => {
        loadScript('case/runtime.js', () => {
            context_003.config = callback();
            run_003();
        });
    });
}

async function run_003() {
    logln('传入的配置: ', context_003.config);
    if (!isMatch(context_003.config)) {
        console.error('不符合以下地址匹配规则');
        console.error(context_003.config.matchList);
        return;
    }
    await getModules_003();
    await getVersions_003();
    drawUI_003();
    updateView_003(-1, '');
}

function drawUI_003() {
    newElement('style', {
        parentNode: document.head
    }, {
        innerHTML: context_003.config.style.css
    });
    const filter = {
        status: Object.values(context_003.const),
    };
    document.body.innerHTML = `<div id="filters">
        <div class="filter-field">
            <div class="filter-line">
                <div class="filter-field-name">版本: </div>
                <select id="dinglj-version" onchange="updateView_003(value, undefined)" value="-1">
                    <option value="-1">当前版本</option>
                    ${ context_003.versions.map(ele => {
                        return `<option value="${ context_003.versions.indexOf(ele) }">${ ele.erpVersion }</option>`;
                    }).join('') }
                </select>
                <div style="flex: 1"></div>
                <div class="filter-field-name">搜索: </div>
                <input id="dinglj-keyword" oninput="updateView_003(undefined, value)" placeholder="请输入关键字(Regex)" type="text"/>
            </div>
        </div>
        <div class="filter-field">
            <div class="filter-field-name">状态: </div>
            ${ filter.status.map(ele => {
                return `<div class="filter-status" title="${ ele.en }" onclick="filterStatus_003(this)">${ ele.zh }</div>`
            }).join('') }
        </div>
    </div>
    <div id="under-filter">
        <div id="left-navigator">
        </div>
        <div id="right-view">
        </div>
        <div id="case-mask">
            <div id="case-modal">
                <div id="modal-title">
                    <div id="modal-case-name"></div>
                    <div class="dinglj-flex"></div>
                    <div id="modal-close" onclick="getById('case-mask').style.display='none'">×</div>
                </div>
            </div>
        </div>
    </div>`;
}

function filterStatus_003(element) {
    if (element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
    updateView_003();
}

function getFilterStatus_003() {
    return getByClass('filter-status active').map(i => i.title);
}

async function updateView_003(version, keyword) {
    version = version || context_003.currentFilters.version;
    keyword = keyword == undefined ? context_003.currentFilters.keyword : keyword;
    let filterStatus = getFilterStatus_003();
    filterStatus.sort();
    if (context_003.currentFilters.version == version && 
        context_003.currentFilters.keyword == keyword && 
        JSON.stringify(filterStatus) == JSON.stringify(context_003.currentFilters.status)) {
        return;
    }
    // 获取当前版本所有用例情况
    let caseList = [];
    if (context_003.dataOfVersion[version]) {
        caseList = context_003.dataOfVersion[version];
    } else {
        caseList = await readCaseList_003(version);
    }
    // 按照状态过滤
    if (filterStatus && filterStatus.length > 0) {
        caseList = caseList.filter(_case => filterStatus.includes(_case.status.en));
    }
    // 按照关键字过滤
    if (keyword && keyword.trim()) {
        let reg = new RegExp(`.*${ keyword.trim() }.*`, 'i');
        caseList = caseList.filter(_case => reg.test(_case.caseName));
    }
    let groups = groupBy(caseList, 'module');
    let modules = Object.keys(groups);
    modules.sort((module1, module2) => {
        let idx1 = context_003.config.order.module.indexOf(module1);
        idx1 = idx1 == -1 ? 999 : idx1;
        let idx2 = context_003.config.order.module.indexOf(module2);
        idx2 = idx2 == -1 ? 999 : idx2;
        if (idx1 == idx2) {
            return module1 < module2 ? -1 : 1;
        }
        return idx1 - idx2;
    })
    if (modules && modules.length == 0) {
        getById('left-navigator').innerHTML = '';
        getById('right-view').innerHTML = `<div class="case-list-not-found-tips">在${ version == -1 ? '当前版本' : `版本[${ context_003.versions[version].erpVersion }]` }中未找到${ (filterStatus && filterStatus.length > 0 || keyword && keyword.trim()) ? '符合条件的' : '' }用例清单</div>`;
        context_003.currentFilters.version = version;
        context_003.currentFilters.keyword = keyword;
        context_003.currentFilters.status = filterStatus;
        return;
    }
    let unitCases = findByPropInList(caseList, 'level', 0);
    if (unitCases && unitCases.length > 0) {
        groups.UNIT = unitCases;
        modules.unshift('UNIT');
    }
    displayModules_003(modules, groups);
    // 计算要激活的模块下标
    let successUnitCount = (unitCases && unitCases.length > 0) ? unitCases.filter(unit => unit.status == context_003.const.SUCCESS).length : -1; // 有单元变更才计算成功数量, 否则为 -1
    let idx = successUnitCount == unitCases.length ? 1 : 0; // 相等表示所有单元测试都通过, 没啥好看的了, 直接看第2个, 反之, 单元测试都没完全通过, 就直接看单元测试
    if (context_003.lastModule) {
        let tmp = modules.indexOf(context_003.lastModule);
        if (tmp > -1) {
            idx = tmp; // 上一个模块还在, 取上一个模块
        }
    }
    getById('left-navigator').children[idx].click();
    context_003.currentFilters.version = version;
    context_003.currentFilters.keyword = keyword;
    context_003.currentFilters.status = filterStatus;
}

async function readCaseList_003(version) {
    let caseList = [], tmp = [];
    if (version == -1) {
        tmp = (await getDefaultCases_003()).testCaseTasks;
    } else {
        tmp = await getCases_003(context_003.versions[version].erpVersion);
    }
    for (let originCase of tmp) {
        let case_ = new Case(originCase);
        caseList.push(case_);
    }
    context_003.dataOfVersion[version] = caseList;
    return caseList;
}

function okCount_003(list) {
    return list && list.length > 0 ? list.filter(i => i.status == context_003.const.SUCCESS) : 0;
}

function okPercent_003(list) {
    return (list && list.length > 0 ? (okCount_003(list).length / list.length * 100) : 0).toFixed(2);
}

function displayModules_003(modules, groups) {
    getById('left-navigator').innerHTML = modules.map(module => {
        return `<div class="module-name" id="module-${ module }" title="通过数(${ okCount_003(groups[module]).length }) : 用例总数(${ groups[module].length }) = 进度(${ okPercent_003(groups[module]) }%)">
            <div class="module-name-progress" style="width: ${ okPercent_003(groups[module]) }; ${ okPercent_003(groups[module]) == 100 ? `background: ${ context_003.config.style.const.successColor }; color: white;` : '' }%"></div>
            <div class="module-name-text">${ module } (${ groups[module].length })</div>
        </div>`;
    }).join('');
    for (let module of modules) {
        let element = getById(`module-${ module }`);
        mouseIOEvent([ element ], (element, event) => {
            element.children[0].style.width = '100%';
        }, (element, event) => {
            if (context_003.lastModule != module) {
                element.children[0].style.width = `${ okPercent_003(groups[module]) }%`;
            }
        });
        element.addEventListener('click', () => {
            changeActiveModule_003(element, module, groups);
        })
    }
}

function changeActiveModule_003(element, moduleName, groups) {
    for (let moduleElement of getByClass('module-name')) {
        if (moduleElement.id == element.id) {
            moduleElement.children[0].style.width = '100%';
            moduleElement.children[0].style.background = context_003.config.style.const.themeColor;
            moduleElement.children[1].style.color = 'white';
            moduleElement.children[1].style.fontWeight = 'bolder';
        } else {
            let thisModule = moduleElement.id.replace('module-', '');
            let progress = okPercent_003(groups[thisModule]);
            moduleElement.children[0].style.background = progress == 100 ? context_003.config.style.const.successColor : context_003.config.style.const.hoverBackground;
            moduleElement.children[0].style.width = `${ progress }%`;
            moduleElement.children[1].style.color = progress == 100 ? 'white' : 'black';
            moduleElement.children[1].style.fontWeight = 'normal';
        }
    }
    context_003.lastModule = moduleName;
    displayCasesOfThisModule_003(element, moduleName, groups[moduleName]);
}

function displayCasesOfThisModule_003(element, moduleName, list) {
    let groups = groupBy(list, '', item => item.status.en);
    let statusNames = Object.keys(groups);
    let order = Object.keys(context_003.const);
    if (context_003.config.order.status && context_003.config.order.status.length > 0) {
        order = context_003.config.order.status;
    }
    statusNames.sort((name1, name2) => {
        let idx1 = order.indexOf(name1);
        idx1 = idx1 == -1 ? 999 : idx1;
        let idx2 = order.indexOf(name2);
        idx2 = idx2 == -1 ? 999 : idx2;
        if (idx1 == idx2) {
            return name1 < name2 ? -1 : 1;
        }
        return idx1 - idx2;
    })
    getById('right-view').innerHTML = statusNames.map(statusName => {
        return `<div class="status-area" id="status-of-${ statusName }">
            <div class="status-area-title">
                <div class="divide-line-before"></div>
                <div class="status-area-name">${ context_003.const[statusName].zh }(${ groups[statusName].length })</div>
                <div class="divide-line-after"></div>
            </div>
            <div class="case-viewer" id="case-list-of-${ statusName }">
                ${ displayCasesOfThisStatus_003(element, statusName, groups[statusName]) }
            </div>
        </div>`;
    }).join('');
}

function displayCasesOfThisStatus_003(element, statusName, list) {
    return list.sort().map(item => {
        return `<div class="case-card">
            <div class="expand-card">
                <div class="card-detail-line">
                    ${ item.ticket ? `<div class="case-ticket-id location-before-name" onclick="window.open('${ context_003.config.urls.ticket }${ item.ticket }')">#${ item.ticket }</div>` : '' }
                    <div class="card-detail-name">${ item.caseName }</div>
                </div>
                <div class="card-detail-line card-detail-key">进度(当前行/总行数):</div>
                <div class="card-detail-line card-detail-value">${ item.currentRow }/${ item.totalRow } (${
                    (item.totalRow == 0 ? 0 : (item.currentRow / item.totalRow * 100)).toFixed(2)
                }%)</div>
                <div class="card-detail-line card-detail-key">进度(当前步骤/总步骤数):</div>
                <div class="card-detail-line card-detail-value">${ item.currentStep }/${ item.totalStep } (${
                    (item.totalStep == 0 ? 0 : (item.currentStep / item.totalStep * 100)).toFixed(2)
                }%)</div>
                ${ item.dbType 
                    ?  `<div class="card-detail-line card-detail-key">数据库:</div>
                        <div class="card-detail-line card-detail-value ${ item.ticket ? 'case-detail-database' : '' }" 
                            ${ item.ticket ? `onclick="copyText('${ getDBLink(item.dbType, item.ticket) }')"` : '' } 
                            ${ item.ticket ? `title="${ getDBLink(item.dbType, item.ticket) }"` : '' }>${
                                item.dbType
                            }</div>`
                    : ''
                }
                ${ displayDetailIfExist_003(item, 'module', '模块') }
                ${ displayDetailIfExist_003(item, 'timeCost', '耗时') }
                <div class="dinglj-flex"></div>
                <div class="card-detail-line">
                    ${ item.zip && item.zip.toLowerCase().endsWith('.zip') ? `<div class="download-zip" title="${ item.zip }" onclick="window.open('${ item.zip }')">下载打包文件</div>` : '' }
                    <div class="dinglj-flex"></div>
                    <div class="open-detail-window" onclick="showDetailModal_003('${ item.caseName }')">更多详情</div>
                </div>
            </div>
            <div class="case-line-1">
                ${ getBeforeCaseName_003(item) }
                <div class="case-name">${ item.caseName.replace(/^2.0[-_]/, '').replace(/.xlsx?/i, '') }</div>
                <div class="dinglj-flex"></div>
                ${ getAfterCaseName_003(item) }
            </div>
            <div class="case-line-2" style="display: ${ item.status == context_003.const.TICKET || item.status == context_003.const.SUCCESS || item.status == context_003.const.RUNNING ? 'flex' : 'none' }">
                <div class="case-row">${ item.currentRow }/${ item.totalRow }</div>
                <div class="dinglj-flex" id="progress-container">
                    <div class="progress-row" 
                        title="行数进度: ${ item.totalRow == 0 ? 0 : ((item.currentRow / item.totalRow * 100).toFixed(2)) }% (${ item.currentRow }/${ item.totalRow })" 
                        style="width: ${  item.currentRow == 0 ? 0 : (item.currentRow / item.totalRow * 100) }%">
                    </div>
                    <div class="progress-step" 
                        title="步骤进度: ${ item.totalStep == 0 ? 0 : ((item.currentStep / item.totalStep * 100).toFixed(2)) }% (${ item.currentStep }/${ item.totalStep })" 
                        style="width: ${  item.currentStep == 0 ? 0 : (item.currentStep / item.totalStep * 100) }%">
                    </div>
                </div>
                <div class="case-row">${ item.currentStep }/${ item.totalStep }</div>
            </div>
        </div>`
    }).join('');
}

function getDBLink(dbType, ticket) {
    let args = [];
    if (dbType == 'mysql') {
        args = [
            `DB_TYPE=MySQL`,
            `DB_SERVER=${ context_003.config.db.mysql.server }`,
            `DB_USER=${ context_003.config.db.mysql.user }`,
            `DB_PASS=${ context_003.config.db.mysql.password }`,
            `DB_NAME=ticket_${ ticket }`
        ]
    } else if (dbType == 'oracle') {
        args = [
            `DB_TYPE=ORACLE`,
            `DB_SERVER=${ context_003.config.db.oracle.server }`,
            `DB_USER=ticket_${ ticket }`,
            `DB_PASS=${ context_003.config.db.oracle.password }`,
            `DB_NAME=${ context_003.config.db.oracle.user }`
        ]
    } else if (dbType == 'sql') {
        args = [
            `DB_TYPE=SQL`,
            `DB_SERVER=${ context_003.config.db.sql.server }`,
            `DB_USER=${ context_003.config.db.sql.user }`,
            `DB_PASS=${ context_003.config.db.sql.password }`,
            `DB_NAME=ticket_${ ticket }`
        ]
    }
    return args.join(';');
}

function getBeforeCaseName_003(item) {
    if (item.ticket) {
        return `<div class="case-ticket-id location-before-name" onclick="window.open('${ context_003.config.urls.ticket }${ item.ticket }')">#${ item.ticket }</div>`;
    }
    if (item.status == context_003.const.SUCCESS) {
        return `<div class="case-success location-before-name">${ context_003.const.SUCCESS.en }</div>`;
    }
    if (item.status == context_003.const.RUNNING) {
        return `<div class="case-running location-before-name">${ context_003.const.RUNNING.en }</div>`;
    }
    return '';
}

function getAfterCaseName_003(item) {
    if (item.timeCost) {
        return `<div class="case-time-cost location-after-name" title=${ item.timeCost }>${ item.timeCost.replaceAll(/[时分]/g, ':').replace('秒', '') }</div>`
    } else {
        return `<div class="case-level location-after-name">Lv.${ item.level ? (isNaN(item.level) ? item.level : parseInt(item.level) + 1) : '?' }</div>`
    }
}

function showDetailModal_003(caseName) {
    getById('modal-case-name').innerText = caseName;
    getById('case-mask').style.display = 'block';
}

function displayDetailIfExist_003(_case, field, name) {
    if (_case[field]) {
        return `<div class="card-detail-line card-detail-key">${
            name
        }: </div>
        <div class="card-detail-line card-detail-value">${
            _case[field]
        }</div>`;
    }
    return ``;
}

async function readOneCaseHistory(caseName) {
    let groups = {};
    if (context_003.details[caseName]) {
        groups = context_003.details[caseName];
    } else {
        let caseList = await getOneCaseHistory_003(caseName);
        caseList = caseList.filter(i => i.batchCode).map(i => {
            let date = /^(\d{8})/.exec(i.batchCode)[1];
            date = date.replaceAll(/(\d{4})(\d{2})(\d{2})/g, '{"year":"$1","month":"$2","day":"$3"}');
            date = JSON.parse(date);
            return {
                batch: /-(\d+)$/.exec(i.batchCode)[1],
                year: date.year,
                month: date.month,
                day: date.day,
                curRow: i.currentRow,
                totalRow: i.totalRow,
                curStep: i.endStepNum,
                totalStep: i.totalStepNum,
                dbType: i.dbType,
                timeCost: i.timeCost,
                version: /^[a-z]+_[a-z]+_[a-z0-9]+_\d{8}_(\d+)/i.exec(i.erpVersion)[1],
            }
        });
        groups = groupBy(caseList, 'month');
        context_003.details[caseName] = groups;
    }
    return groups;
}