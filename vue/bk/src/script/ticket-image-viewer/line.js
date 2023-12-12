export default {
    template: `<div id="line-container">
        <div :class="{ 'line': true, 'arrow': true, 'active': arrow == 'line' }">
            <div :title="lineNumber" :class="{ 'line-number': true, 'active': current == idx, 'last': last == idx }" v-for="(lineNumber, idx) of lines" @click="setIdx(idx)">
                {{ lineNumber }}
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
        dinglj.timer(() => {
            if (this.lines.length > 0) {
                this.setIdx(this.lines.length - 1, true, true);
                return true;
            }
            return false;
        });
        /** 方向键绑定 */
        dinglj.msg.on('update-line', (that, prop) => this.doScroll(prop));
        /** 上一行 */
        dinglj.msg.on('toPrevLine', that => this.setIdx(this.current - 1, true, true));
        /** 下一行 */
        dinglj.msg.on('toNextLine', that => this.setIdx(this.current + 1, true, false));
        /** 跳转到指定行 */
        dinglj.msg.on('jumpToLine', (that, lineNumber) => {
            let idx = this.lines.indexOf(lineNumber);
            if (idx != -1) {
                this.setIdx(idx);
            }
        });
    },
    methods: {
        setIdx(i, toStep = false, toLastStep = false) {
            const lineContainer = dinglj.byClass('line arrow')[0];
            if (lineContainer) {
                const limit = dinglj.iv.getLimit(lineContainer);
                this.doScroll({
                    size: this.lines.length,
                    current: i,
                    direction: 0,
                    height: window.dinglj.iv.getOneHeight(lineContainer),
                    qty: window.dinglj.iv.getScrollQty(i, limit, 0),
                    toStep: toStep,
                    toLastStep: toLastStep,
                });
            }
        },
        doScroll(prop) {
            const next = prop.current + prop.direction;
            if (next < 0) {
                '已经到第一行了'.info();
                return;
            } else if (next >= prop.size) {
                '已经到最后一行了'.info();
                return;
            } else if (this.current == next) {
                return;
            }
            dinglj.byId('line-container').scrollTo(0, prop.height * prop.qty);
            this.last = this.current;
            this.current = next;
            dinglj.msg.send(this, 'line-changed', {
                line: this.lines[next],
                expect: !!prop.toLastStep ? -1 : 0,
                toStep: !!prop.toStep
            });
            dinglj.msg.send(this, 'change-active-panel', 'line');
        }
    },
    computed: {
        lines() {
            const readLineRegExp = /.*<a href="([0-9]+\/)".*/;
            if (window.readLines) {
                return window.readLines();
            }
            const response = dinglj.get(`${ window.location.href }1`);
            const lineNumbers = response.split('\n');
            return lineNumbers.map(line =>  readLineRegExp.test(line) ? readLineRegExp.exec(line)[1] : '')
                .filter(href => href != '')
                .map(href => href.replace(/\/$/, ''));
        }
    },
    props: {
        arrow: {
            type: String,
            default: 'step',
            required: true,
        },
    },
}