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
    let selectOwner = generateSelect('dinglj-owner-filter', Array.from(new Set(context_004.rt.tickets.map(t => t.owner))), 'onOwnerFilterChange');
    let components = Array.from(new Set(context_004.rt.tickets.map(t => t.component)));
    let groupBy = generateSelect('dinglj-filter-group-by', context_004.fields.zhCN, 'onGroupByChange', '模块');
    let modeList = [new LangItem('nav', '导航显示'), new LangItem('tab', '分页显示'), new LangItem('noti', '分栏显示')]
    $('#dinglj-filter')[0].innerHTML = `<div class="filter-line">
        <div class="filter-name">属主: </div>
        <div class="filter-value">${ selectOwner }</div>
    </div>
    <div class="filter-line">
        <div class="filter-name">组件: </div>
        ${ components.map(comp => `<div class="dinglj-filter-component" id="comp-${ comp }" onclick="doSelectComponents('comp-${ comp }')">${ comp }</div>`).join('') }
    </div>
    <div class="filter-line">
        <div class="filter-name">显示模式: </div>
        ${ modeList.map(mode => `<div class="dinglj-filter-mode ${ context_004.config.filter.defaultMode == mode.zh ? 'active' : '' }" id="mode-${ mode.en }" onclick="doChangeMode('mode-${ mode.en }')">${ mode.zh }</div>`).join('') }
    </div>
    <div class="filter-line">
        <div class="filter-name">分组模式: </div>
        <div class="filter-value">${ groupBy }</div>
    </div>
    `
}

function refreshTickets_004(components = [], mode = '导航显示', groupByName = '模块') {
    console.log(`显示模式: ${ mode }`);
    let data = JSON.parse(JSON.stringify(context_004.rt.tickets));
    if (components.length > 0) { // 有数据, 根据组件过滤
        data = data.filter(t => components.includes(t.component))
    }
    let groupIdx = context_004.fields.zhCN.indexOf(groupByName);
    let groupField = context_004.fields.display[groupIdx];
    data = groupBy(data, groupField);
    console.log(data);
}
