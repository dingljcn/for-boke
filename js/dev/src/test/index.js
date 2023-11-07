import '../../extension.js';
import { addCssLink, computeIfAbsent, remById } from '../../global.js';
import { createApp, ref } from "../../../vue.js";
import './register.js';

/***************** 界面优化 *****************/
addCssLink('https://dingljcn.github.io/for-boke/js/dev/src/test/index.css');
for (let i = 0; i < document.head.children.length; i++) {
    if (document.head.children[i].tagName == 'TITLE') {
        document.head.children[i].innerText = '回归测试变更 - by dinglj';
        break;
    }
}
getById('main').innerHTML = `<div id="dinglj-hidden-blocks" style="display: none"></div>
<div id="dinglj-filter"></div>
<div id="dinglj-main">
    <div id="dinglj-loading-data">
        <img src="https://dingljcn.github.io/for-boke/js/assets/loading.gif"/>
        <div>loading...</div>
    </div>
</div>`;
remById('footer');
/***************** 请求数据 *****************/
await loadRptData_004();
/***************** 解析数据 *****************/
readTickets_004();
/***************** 初始化界面 *****************/
remById('dinglj-hidden-blocks');
getById('dinglj-main').innerHTML = `<div>
    <h1>{{ message }}</h1>
    <input type="button" value="click" @click="printRt"/>
</div>`
/***************** 构建 Vue 程序 *****************/
createApp({
    setup() {
        const message = ref('hello, vue');
        const runtime = ref(window.context_004);
        function printRt() {
            console.log(runtime);
        }
        return {
            message, runtime, printRt
        }
    }
}).mount('#dinglj-main');

/** 请求数据 */
async function loadRptData_004() {
    let htmlText = await $.get(context_004.config.report_url);
    htmlText = htmlText.substring(htmlText.indexOf('<div id="banner">'), htmlText.indexOf('</body>') + '</body>'.length);
    htmlText = htmlText.replaceAll(/id="/g, 'id="dinglj-rpt-');
    getById('dinglj-hidden-blocks').innerHTML = htmlText;
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