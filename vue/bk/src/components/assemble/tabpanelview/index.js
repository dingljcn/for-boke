import tabpanel from "../../base/tabpanel/index.js";
import rowscroll from "../../base/rowscroll/index.js";

export default {
    template: `<div class="dinglj-v-tab-panel-view" :id="id">
        <tabpanel :names="names" :get-value="getValue" :get-tab-name="getName" @on-change="setCurrent" @mounted="data => tabPanelId = data">
            <rowscroll :current-idx="currentIdx" :size="names.length">
                <slot></slot>
            </rowscroll>
        </tabpanel>
    </div>`,
    mounted() {
        /** 下一个 Tab 页事件 */
        dinglj.msg.on('tab-view:next', this.id, () => {
            dinglj.msg.send(this, 'tab-panel:next', this.tabPanelId, null);
        });
        /** 指定 Tab 页事件 */
        dinglj.msg.on('tab-view:to', this.id, (that, to) => {
            dinglj.msg.send(this, 'tab-panel:to', this.tabPanelId, to);
        });
        this.$emit('mounted', this.id);
    },
    data() {
        return {
            current: '',
            id: dinglj.uuid('tab-panel-view'),
            tabPanelId: '',
        }
    },
    methods: {
        setCurrent(value) {
            this.current = value;
            this.$emit('on-change', {
                value: value,
                id: this.id,
            })
        }
    },
    props: {
        names: {
            type: Array,
            default: []
        },
        getValue: {
            type: Function,
            default: i => i,
        },
        getName: {
            type: Function,
            default: i => i,
        }
    },
    computed: {
        currentIdx() {
            return this.names.map(n => this.getValue(n)).indexOfIgnoreCase(this.current);
        }
    },
    components: {
        tabpanel, rowscroll
    }
}