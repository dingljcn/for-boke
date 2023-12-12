import switchx from "../../components/base/switchx/index.js";
import combo from "../../components/base/combo/index.js";

export default {
    template: `<div id="ticket-list-filter">
        <div class="filter-row">
            <combo class="filter-contrl" @on-change="data => { filter.owner = data; $emit('on-change', filter) }" 
                :values="owners" 
                :get-value="i => i" 
                :get-label="i => i" 
                caption="属主" 
                placeholder="请选择属主">
            </combo>
            <combo class="filter-contrl" @on-change="data => { filter.status = data; $emit('on-change', filter) }" 
                :values="statuses" 
                :get-value="i => i" 
                :get-label="i => i" 
                caption="状态" 
                placeholder="请选择状态">
            </combo>
            <combo class="filter-contrl" @on-change="data => { filter.reporter = data; $emit('on-change', filter) }" 
                :values="reporters" 
                :get-value="i => i" 
                :get-label="i => i" 
                caption="报告者" 
                placeholder="请选择报告者">
            </combo>
            <combo class="filter-contrl" @on-change="data => { filter.component = data; $emit('on-change', filter) }" 
                :values="components" 
                :get-value="i => i" 
                :get-label="i => i" 
                caption="模块" 
                placeholder="请选择模块">
            </combo>
        </div>
    </div>`,
    data() {
        return {
            filter: {}
        }
    },
    methods: {
        getComboData(column) {
            const result = Array.from(new Set(this.data.map(i => i[column])));
            const order = dinglj.getConfigOrDefault(this.config, this.defaultConfig, `strategy.order.group.${ column }`, [], false);
            result.sort((s1, s2) => {
                return dinglj.compareStringByArray(order, s1, s2);
            })
            return result;
        }
    },
    computed: {
        owners() {
            return this.getComboData('owner');
        },
        statuses() {
            return this.getComboData('status');
        },
        reporters() {
            return this.getComboData('reporter');
        },
        components() {
            return this.getComboData('component');
        },
        config() {
            return window.readConfig();
        },
        defaultConfig() {
            return window.defaultConfig();
        }
    },
    props: {
        data: {
            type: Array,
            default: [],
            required: true,
        }
    },
    components: {
        switchx, combo
    }
}