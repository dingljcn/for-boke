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
}

function drawUI_003() {
    newElement('style', {
        parentNode: document.head
    }, {
        innerHTML: context_003.config.style.css
    });
    const filter = {
        status: [
            { key: 'NOTSEND', name: '待发送' },
            { key: 'RUNNING', name: '执行中' },
            { key: 'SUCCESS', name: '成功' },
            { key: 'TICKET', name: '变更中断' },
        ]
    };
    document.body.innerHTML = `<div id="filters">
        <div class="filter-field">
            <div class="filter-line">
                <div class="filter-field-name">版本: </div>
                <select id="dinglj-version" onchange="updateView_003(value, undefined, undefined)" value="-1">
                    <option value="-1">当前版本</option>
                    ${ context_003.versions.map(ele => {
                        return `<option value="${ context_003.versions.indexOf(ele) }">${ ele.erpVersion }</option>`;
                    }).join('') }
                </select>
                <div style="flex: 1"></div>
                <div class="filter-field-name">搜索: </div>
                <input id="dinglj-keyword" onchange="updateView_003(undefined, value, undefined)" placeholder="请输入关键字(Regex)" type="text"/>
            </div>
        </div>
        <div class="filter-field">
            <div class="filter-field-name">状态: </div>
            ${ filter.status.map(ele => {
                return `<div class="filter-status" title="${ ele.key }" onclick="filterStatus_003(this)">${ ele.name }</div>`
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
}

function getFilterStatus_003() {
    let arr = [];
    arr.push(...getByClass('filter-status active'));
    return arr.map(i => i.title);
}

async function updateView_003(version, keyword, status) {
    version = version || context_003.currentFilters.version;
    keyword = keyword || context_003.currentFilters.keyword;
    status = status || context_003.currentFilters.status;
    if (context_003.currentFilters.version == version && context_003.currentFilters.keyword == keyword && context_003.currentFilters.status == status) {
        return;
    }
    // 获取当前版本所有用例情况
    let caseList = [];
    if (context_003.dataOfVersion[version]) {
        caseList = context_003.dataOfVersion[version];
    } else {
        caseList = readCaseList_003();
    }
    context_003.currentFilters.version = version;
    context_003.currentFilters.keyword = keyword;
    context_003.currentFilters.status = status;
}

async function readCaseList_003() {
    let caseList = [], tmp = [];
    if (version == -1) {
        tmp = await getDefaultCases_003().testCaseTasks;
    } else {
        tmp = await getCases_003();
    }
    for (let originCase of tmp) {
        let case_ = new Case(originCase);
        caseList.push(case_);
    }
    context_003.dataOfVersion[version] = caseList;
    return caseList;
}