import tablex from "../../components/base/tablex/index.js";
import { Case } from "./entity/Case.js";

export default {
    template: `<div class="mode-container table">
        <tablex v-for="statusName in statusNames" class="every-tab" @on-loaded="postTableShow" 
                :columns="getColumnsToDisplay(statusName)"  
                :data="groupData[statusName]" 
                :flex-columns="['caseName']">
        </tablex>
    </div>`,
    props: {
        groupData: Object,
        statusNames: {
            type: Array,
            default: []
        },
    },
    computed: {
        config() {
            return window.readConfig();
        },
        defaultConfig() {
            return window.defaultConfig();
        }
    },
    methods: {
        postTableShow(id) {
            const list = dinglj.query(`#${ id } .dinglj-v-tbody .dinglj-v-cell.ticket`);
            list.forEach(i => {
                const text = i.innerText.trim();
                if (text) {
                    i.innerHTML = `<div onclick="window.open('${ dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'urls.ticket', '', false) }/${ text }', '#${ text }')">#${ text }</div>`;
                }
            })
        },
        /** 计算某模块, 某状态下有哪些列要显示 */
        getColumnsToDisplay(statusName) {
            if (!this.groupData || !this.groupData[statusName] || !this.groupData[statusName].length) {
                return [];
            }
            // 先把所有列计算出来
            let fields = Object.keys(new Case());
            let ignoreColumns = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'table.ignoreColumn', [], false);
            const list4Display = this.groupData[statusName];
            const result = fields.filter(fieldName => {
                // 根据配置把忽略的列过滤掉
                if (ignoreColumns.includesIgnoreCase(fieldName)) {
                    return false;
                }
                // 然后看看有没有哪一列是完全没有数据的, 也过滤掉, 只要这列在任意行有数据, 都不会过滤掉
                for (let _case_ of list4Display) {
                    if (_case_ && _case_[fieldName]) {
                        return true;
                    }
                }
                return false
            }).map(fieldName => { return { 'label': Case.getCaption(fieldName), 'value': fieldName } });
            return result;
        },
    },
    components: {
        tablex
    }
}