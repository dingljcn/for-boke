function prepare_scripts_004(loadScript, callback) {
    loadScript('utils.js', () => {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://dingljcn.github.io/for-boke/beta/test/index.css?version=' + Math.random();
        document.head.appendChild(link);
        loadScript('test/tool.js', () => {
            context_004.config = callback();
            run_004();
        })
    })
}

async function run_004() {
    logln('传入的配置: ', context_004.config);
    if (!isMatch(context_004.config)) {
        console.error('不符合以下地址匹配规则');
        console.error(context_004.config.matchList);
        return;
    }
    await loadRptData_004();
    readTickets_004();
    drawFilter();
    invokeRefresh_004();
}

async function loadRptData_004() {
    let htmlText = await $.get(context_004.config.report_url);
    htmlText = htmlText.substring(htmlText.indexOf('<div id="banner">'), htmlText.indexOf('</body>') + '</body>'.length);
    htmlText = htmlText.replaceAll(/id="/g, 'id="dinglj-rpt-');
    getById('main').innerHTML = `
        <div id="dinglj-hidden-blocks" style="display: none">${ htmlText }</div>
        <div id="dinglj-filter"></div>
        <div id="dinglj-main"></div>
    `
}

function readTickets_004() {
    let func = (list) => {
        for (let i = 0; i < list.length; i++) {
            let trData = list[i].innerText.replaceAll(/\n\s*/g, '\n');
            let cells = trData.split('\n').map(c => c.trim()).filter(c => c != '');
            let object = {};
            for (let j = 0; j < cells.length; j++) {
                object[context_004.fields.origin[j]] = cells[j];
            }
            context_004.rt.tickets.push(object);
        }
    }
    func($('.even'));
    func($('.odd'));
}

function drawFilter() {
    let components = getTicketFieldValues('component');
    let owners = getTicketFieldValues('owner');
    let modeList = [new LangItem('nav', '导航显示'), new LangItem('tab', '分页显示'), new LangItem('noti', '分栏显示')]
    let selectOwner = generateSelect('dinglj-owner-filter', owners, {
        callback: 'onOwnerFilterChange',
        className: 'dinglj-owner-filter-selector'
    });
    let groupBy = generateSelect('dinglj-filter-group-by', context_004.fields.zhCN, {
        callback: 'onGroupByChange',
        defaultValue: '模块'
    });
    $('#dinglj-filter')[0].innerHTML = `
    <div class="filter-line">
        <div class="filter-name">分组模式: </div>
        <div class="filter-value">${ groupBy }</div>
    </div>
    <div class="filter-line">
        <div class="filter-name">属主: </div>
        <div class="filter-value">${ selectOwner }</div>
    </div>
    <div class="filter-line">
        <div class="filter-name">显示模式: </div>
        ${ modeList.map(mode => `<div class="dinglj-filter-mode ${ context_004.config.filter.defaultMode == mode.zh ? 'active' : '' }" id="mode-${ mode.en }" onclick="doChangeMode('mode-${ mode.en }')">${ mode.zh }</div>`).join('') }
    </div>
    <div class="filter-line">
        <div class="filter-name">组件: </div>
        ${ components.map(comp => `<div class="dinglj-filter-component" id="comp-${ comp }" onclick="doSelectComponents('comp-${ comp }')">${ comp }</div>`).join('') }
    </div>
    `
}

function refreshTickets_004(ownerList = [], components = [], mode = '导航显示', groupByName = '模块') {
    console.log(`显示模式: ${ mode }`);
    let data = JSON.parse(JSON.stringify(context_004.rt.tickets));
    if (components.length > 0) { // 有数据, 根据组件过滤
        data = data.filter(t => components.includes(t.component));
    }
    if (ownerList.length > 0) {
        let ownerNames = getTicketFieldValues('owner');
        ownerList = ownerList.filter(name => ownerNames.includes(name)); // 将不存在的名字过滤
        data = data.filter(t => ownerList.inlcudes(t.owner)); // 正式对输入进行过滤
    }
    // 分组
    let groupIdx = context_004.fields.zhCN.indexOf(groupByName);
    let groupField = context_004.fields.display[groupIdx];
    data = groupBy(data, groupField);
    console.log(data);
}
