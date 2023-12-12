export default {
    template: `<div id="history-container" class="right-panel" @click="changePanel">
        <div :class="{ 'history': true, 'arrow': true, 'active': arrow == 'history' }">
            <div :title="historyNumber" :class="{ 'history-number': true, 'active': current == idx, 'last': last == idx }" v-for="(historyNumber, idx) of list" @click="setIdx(idx)">
                {{ historyNumber.substring(2).replace(/\.png/, '') }}
            </div>
        </div>
    </div>`,
    data() {
        return {
            current: -1,
            last: -1,
        }
    },
    mounted() {
        /** 快捷键: 上/下一个 */
        dinglj.msg.on('update-history', (that, prop) => {
            this.doScroll(prop);
        });
    },
    methods: {
        /** 点击时切换到 history 面板 */
        changePanel() {
            dinglj.msg.send(this, 'change-active-panel', 'history');
        },
        setIdx(i) {
            const historyContainer = dinglj.byClass('history arrow')[0];
            if (historyContainer) {
                const limit = dinglj.iv.getLimit(historyContainer);
                this.doScroll({
                    size: this.list.length,
                    current: i,
                    direction: 0,
                    height: window.dinglj.iv.getOneHeight(historyContainer),
                    qty: window.dinglj.iv.getScrollQty(i, limit, 0),
                });
            }
        },
        doScroll(prop) {
            const next = prop.current + prop.direction;
            if (next < 0) {
                '已经是第一张'.info();
                return;
            } else if (next >= prop.size) {
                '已经是最后一张'.info();
                return;
            } else if (this.current == next) {
                return;
            }
            dinglj.byId('history-container').scrollTo(0, prop.height * prop.qty);
            this.last = this.current;
            this.current = next;
            dinglj.msg.send(this, 'tab-view:to', this.tabPanelId, '当前图片')
            dinglj.msg.send(this, 'change-img', this.list[next]);
        }
    },
    props: {
        list: {
            type: Array,
            default: [],
            required: true,
        },
        arrow: {
            type: String,
            default: 'line',
            required: true,
        },
        tabPanelId: {
            type: String,
        }
    },
    watch: {
        arrow(newVal) {
            /** 初始的 history 面板是没有选项的, 当第一次激活 history 面板才有 */
            if ('history' == this.arrow && this.current == -1 && this.last == -1 && this.list.length > 0) {
                this.setIdx(0);
            }
        }
    }
}