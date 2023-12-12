import inputx from '../../components/base/inputx/index.js';
import combo from '../../components/base/combo/index.js';
import switchx from '../../components/base/switchx/index.js';
import btn from '../../components/base/btn/index.js';

export default {
    template: `<div id="case-filter">
        <div class="filter-row">
            <inputx caption="搜索" placeholder="请输入关键字"
                @on-input="data => filter.keyword = c.value">
            </inputx>
            <combo caption="状态" placeholder="请选择状态"
                style="margin-left: 10px"
                :values="Object.values(constant.status)"
                :get-value="i => i.en" 
                :get-label="i => i.zh"
                @on-change="s => filter.status = s">
            </combo>
            <combo caption="版本" placeholder="默认为当前版本"
                style="margin-left: 10px; --width: 400px"
                :values="versionNames"
                :get-value="i => i" 
                :get-label="i => i"
                @on-change="v => filter.versions = v">
            </combo>
            <div style="flex: 1"></div>
            <switchx pre-text="卡片视图" post-text="表格视图" @on-change="bool => filter.mode = (bool ? 'table' : 'card')">
            </switchx>
        </div>
        <div class="filter-row" v-if="filter.mode == 'card'">
            <inputx caption="每列的卡片数" placeholder="请输入每列的卡片数量"
                default-value="7"
                @on-input="data => filter.cardCnt = ((isNaN(data.value) || data.value < 5) ? 5 : parseInt(data.value))">
            </inputx>
        </div>
    </div>`,
    data() {
        return {
            filter: {
                keyword: '',
                status: undefined,
                versions: '',
                mode: 'card',
                cardCnt: 7,
            },
            versionList: [],
        }
    },
    props: {
        constant: Object,
    },
    watch: {
        filter: {
            handler(newVal, oldVal) {
                this.$emit('on-change', newVal);
            },
            deep: true
        }
    },
    computed: {
        config() {
            return window.readConfig();
        },
        defaultConfig() {
            return window.defaultConfig();
        },
        versions() {
            if (dinglj.isDev()) {
                return readVersion();
            }
            if (this.versionList.length == 0) {
                let versions = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'urls.versions', '', false);
                this.versionList = JSON.parse(dinglj.get(versions));
            }
            return this.versionList;
        },
        versionNames() {
            return this.versions.map(i => i.erpVersion);
        },
    },
    components: {
        inputx, combo, switchx, btn
    }
}