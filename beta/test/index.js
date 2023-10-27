function prepare_scripts_004(loadScript, callback) {
    loadScript('utils.js', () => {
        loadScript('test/index.css', () => {});
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
}

async function loadRptData_004() {
    let htmlText = await $.get(context_004.config.report_url);
    htmlText = htmlText.substring(htmlText.indexOf('<div id="banner">'), htmlText.indexOf('</body>') + '</body>'.length);
    htmlText = htmlText.replaceAll(/id="/g, 'id="dinglj-rpt-');
    $('#main')[0].innerHTML = `
        <div id="dinglj-hidden-blocks" style="display: none">${ htmlText }</div>
        <div id="dinglj-filter"></div>
        <div id="dinglj-main"></div>
    `;
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
            context_004.runtime.tickets.push(object);
        }
    }
    func($('.even'));
    func($('.odd'));
}
