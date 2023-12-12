/** Tab 页面板, 传入 [ { label, value } ] 形式的名称列表 */
export default {
    template: `<div class="dinglj-v-tab-panel" :id="id" v-if="names.length > 0">
        <div class="dinglj-v-tabpanel-title">
            <div class="dinglj-v-tab-float"></div>
            <div :class="'dinglj-v-tabpanel-item' + (currentIdx == idx ? ' active' : '')" :id="id + '-' + idx" v-for="(item, idx) in names" @click="clicked(item, idx)">
                {{ getTabName(item) }}
            </div>
        </div>
        <div class="dinglj-v-tabpanel-view">
            <slot class="tab-panel-content"></slot>
        </div>
    </div>
    <div v-else>
        <h1>未找到数据</h1>
    </div>`,
    data() {
        return {
            currentName: '',
            id: dinglj.uuid('tab')
        }
    },
    mounted() {
        this.clicked(this.names[0], 0);
        /** 下一个 Tab 页事件 */
        dinglj.msg.on('tab-panel:next', this.id, () => {
            const next = (this.currentIdx + 1 + this.names.length) % this.names.length;
            this.clicked(this.names[next], next);
        });
        dinglj.msg.on('tab-panel:to', this.id, (that, to) => {
            const result = this.names.filter(item => this.getValue(item) == to);
            if (result.length > 0) {
                this.clicked(result[0], this.names.indexOf(result[0]));
            }
        });
        this.$emit('mounted', this.id);
    },
    methods: {
        clicked(item, idx) {
            if (item) {
                this.currentName = this.getTabName(item);
            }
            this.$emit('on-change', this.getValue(item));
            const floatElement = dinglj.query(`#${ this.id } .dinglj-v-tab-float`)[0];
            const element = dinglj.byId(`${ this.id }-${ idx }`);
            if (element) {
                floatElement.style.width = `${ element.offsetWidth }px`;
                floatElement.style.left = `${ element.offsetLeft }px`;
            }
        }
    },
    props: {
        names: {
            type: Array,
            required: true
        },
        getTabName: {
            type: Function,
            default: item => item.label
        },
        getValue: {
            type: Function,
            default: item => item.value
        }
    },
    computed: {
        tabNames() {
            return this.names.map(i => this.getTabName(i));
        },
        currentIdx() {
            if (this.currentName == '' || !this.tabNames.includesIgnoreCase(this.currentName)) {
                // 没有值, 或值不存在, 重置值
                if (this.tabNames.length > 0) {
                    this.clicked(this.names[0], 0);
                }
                return 0;
            }
            return this.tabNames.indexOfIgnoreCase(this.currentName);
        }
    }
}