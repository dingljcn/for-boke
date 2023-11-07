import '../../extension.js';
import { computeIfAbsent } from '../../global.js';
import { createApp, ref } from "../../../vue.js";

/***************** 获取配置 *****************/
window.context_004 = {
    config: configBuilder_004()
};
/***************** 界面优化 *****************/
for (let i = 0; i < document.head.children.length; i++) {
    if (document.head.children[i].tagName == 'TITLE') {
        document.head.children[i].innerText = '回归测试变更 - by dinglj';
        break;
    }
}
/***************** 请求数据 *****************/
await loadRptData_004();
/***************** 解析数据 *****************/
readTickets_004();
/***************** 初始化界面 *****************/
getById('dinglj-main').innerHTML = `<div>
    <h1>{{ message }}</h1>
</div>`

createApp({
    setup() {
        const message = ref('hello, vue');
        return {
            message
        }
    }
}).mount('#dinglj-main');

/** 请求数据 */
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

/** 解析数据 */
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