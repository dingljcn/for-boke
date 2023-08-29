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
        return;
    }
    displayModules_003(modules);
    // 计算要激活的模块下标
    let idx = 0;
    if (context_003.lastModule) {
        idx = modules.indexOf(context_003.lastModule);
        if (idx == -1) { // 上一个模块在当前过滤条件下不存在, 取第一个模块
            idx = 0;
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
        tmp = await getCases_003(context_003.versions[version]);
    }
    for (let originCase of tmp) {
        let case_ = new Case(originCase);
        caseList.push(case_);
    }
    context_003.dataOfVersion[version] = caseList;
    return caseList;
}

function displayModules_003(modules) {
    getById('left-navigator').innerHTML = modules.map(module => {
        return `<div class="module-name" id="module-${ module }" onclick="changeActiveModule_003(this, innerText)">${ module }</div>`;
    }).join('');
}

function changeActiveModule_003(element, moduleName) {
    let oldActive = getByClass('module-name active');
    if (oldActive) {
        oldActive.forEach(ele => ele.classList.remove('active'));
    }
    element.classList.add('active');
    context_003.lastModule = moduleName;
}