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
    /********************** 模块过滤器 ************************/
    let components = getTicketFieldValues('component');
    /********************** 属主过滤器 ************************/
    let owners = getTicketFieldValues('owner');
    /********************** 显示方式切换 ************************/
    let modeList = [new LangItem('nav', '导航显示'), new LangItem('tab', '分页显示'), new LangItem('noti', '分栏显示')]
    let selectOwner = generateSelect('dinglj-owner-filter', owners, {
        callback: 'onOwnerFilterChange',
        className: 'dinglj-owner-filter-selector'
    });
    /********************** 分组方式切换 ************************/
    let groupByMethods =  context_004.fields.zhCN.filter(n => !(['变更号', '概述', '修改时间'].includes(n))); // 不允许以这几个进行分组, 因为可分组性太低了, 基本上都是唯一的
    let groupBy = generateSelect('dinglj-filter-group-by', groupByMethods, {
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
        <div class="filter-name">模块: </div>
        ${ components.map(comp => `<div class="dinglj-filter-component" id="comp-${ comp }" onclick="doSelectComponents('comp-${ comp }')">${ comp }</div>`).join('') }
    </div>
    `
}

function refreshTickets_004(ownerList = [], components = [], mode = '导航显示', groupByName = '模块') {
    console.log(`显示模式: ${ mode }`);
    let data = JSON.parse(JSON.stringify(context_004.rt.tickets));
    /************************** 组件过滤 *********************/
    if (components.length > 0) {
        data = data.filter(t => components.includes(t.component));
    }
    /************************** 属主过滤 *********************/
    let ownerNames = getTicketFieldValues('owner');
    ownerList = ownerList.filter(name => ownerNames.includes(name)); // 先把条件中不存在的名称过滤掉
    if (ownerList.length > 0) {
        data = data.filter(t => ownerList.includes(t.owner)); // 正式对输入进行过滤
    }
    /************************** 分组 *********************/
    let groupIdx = context_004.fields.zhCN.indexOf(groupByName);
    let groupField = context_004.fields.display[groupIdx];
    data = groupBy(data, groupField);
    /************************** 显示 *********************/
    switch (mode) {
        case '导航显示': displayTickets_NavigatorMode(data); break;
        case '分页显示': break;
        case '分栏显示': break;
    }
}

function displayTickets_NavigatorMode(data) {
    let navHTML = Object.keys(data).map(m => {
        return `<div class="dinglj-nav-item" onclick="onNavChange_004('${ encodeUID(m) }')" id="mode-${ encodeUID(m) }">
            <div class="nav-name">${ m }(${ data[m].length })</div>
            <div class="nav-mask"></div>
        </div>`;
    }).join('');
    getById('dinglj-main').innerHTML = `<div id="dinglj-navigator-display-mode">
        <div id="dinglj-navigator">${ navHTML }</div>
        <div id="ticket-list-view"></div>
    </div>`;
    context_004.rt.filteredData = data;
    let navigators = getByClass('dinglj-nav-item');
    if (navigators && navigators.length > 0) {
        navigators[0].click();
    }
}

function generateTable_004(tableKey = '', list = []) {
    if (list.length == 0) {
        return '';
    }
    console.log(1);
    let thead = generateTableHead_004(tableKey);
    let tbody = generateTableData_004(tableKey, list);
    return `<div id="table-of-${ tableKey }" class="dinglj-table-container">${ thead }${ tbody }</div>`;
}

function generateTableHead_004(tableKey = '') {
    let html = `<div class="dinglj-cell dinglj-column-id">
        <input id="check-all-${ tableKey }" type="checkbox" style="margin-right: 20px" onclick="onTableCheckAll('${ tableKey }')"/>
        <div>变更号</div>
    </div>`;
    for (let i = 1; i < context_004.fields.display.length; i++) {
        let key = context_004.fields.display[i];
        let caption = context_004.fields.zhCN[i];
        html += `<div class="dinglj-cell dinglj-column-${ key }">${ caption }</div>`
    }
    return `<div class="dinglj-tr dinglj-thead">${ html }</div>`;
}

function generateTableData_004(tableKey = '', list) {
    let html = [];
    for (let line of list) {
        let ticketID = /.*#(\d+).*/.exec(line.id)[1];
        let lineHTML = `<div class="dinglj-cell dinglj-column-id">
            <input class="check-${ tableKey }" id="check-${ ticketID }" type="checkbox"/>
            <div onclick="getById('check-${ ticketID }').checked = true; window.open('${ context_004.config.ticket_url }/${ ticketID }');">${ line.id }</div>
        </div>`;
        for (let i = 1; i < context_004.fields.display.length; i++) {
            let key = context_004.fields.display[i];
            lineHTML += `<div class="dinglj-cell dinglj-column-${ key }" ${ key == 'summary' ?  `onmouseenter="onMouseIn(this,'${ ticketID }')"` : '' }>${ line[key] }</div>`;
        }
        html.push(`<div class="dinglj-tr dinglj-data">${ lineHTML }</div>`);
    }
    return `<div class="dinglj-tdata" onmouseleave="getByClass('ticket-menu').forEach(e => e.remove())">${ html.join('') }</div>`;
}
