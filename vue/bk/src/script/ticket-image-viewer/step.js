export default {
    template: `<div id="step-container">
        <div :class="{ 'step': true, 'arrow': true, 'active': arrow == 'step' }">
            <div :title="stepNumber" :class="{ 'step-number': true, 'active': current == idx, 'last': last == idx }" v-for="(stepNumber, idx) of steps" @click="setIdx(idx)">
                {{ stepNumber.replace(/\.png/, '') }}
            </div>
        </div>
    </div>`,
    data() {
        return {
            map: {},
            current: -1,
            last: -1,
            line: '',
            lastSteps: [],
        }
    },
    mounted() {
        /** 行加载完后会调用这里, 进行初始化 */
        dinglj.msg.on('init-steps', (that, line) => {
            this.line = line;
            dinglj.timer(() => {
                if (this.steps.length > 0) {
                    this.setIdx(this.steps.length - 1);
                    return true;
                }
                return false;
            });
        });
        /** 行切换事件 */
        dinglj.msg.on('line-changed', (that, data) => {
            this.lastSteps = this.steps;
            this.line = data.line;
            dinglj.timer(() => {
                if (this.lastSteps != this.steps) {
                    if (data.expect) { // 指定了下标
                        if (data.expect > 0 && data.expect < this.steps.length) {
                            this.setIdx(data.expect, true); // 下标在范围内, 按指定下标跳转
                        } else {
                            this.setIdx(this.steps.length - 1, true); // 不在范围内, 跳到最后一个
                        }
                    } else {
                        this.setIdx(0, true); // 默认到第一个
                    }
                    if (!data.toStep) {
                        dinglj.msg.send(this, 'change-active-panel', 'line'); // 焦点还给行
                    }
                    return true;
                }
                return false;
            });
        })
        /** 方向键绑定 */
        dinglj.msg.on('update-step', (that, prop) => this.doScroll(prop));
        /** 跳转到指定步骤 */
        dinglj.msg.on('jumpToStep', (that, stepNumber) => {
            let idx = -1;
            for (let i = 0; i < this.steps.length; i++) {
                if (this.steps[i].startsWith(`${ stepNumber }_`)) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                this.setIdx(idx);
            }
        });
    },
    methods: {
        setIdx(i, lineChanged = false) {
            const stepContainer = dinglj.byClass('step arrow')[0];
            if (stepContainer) {
                const limit = dinglj.iv.getLimit(stepContainer);
                this.doScroll({
                    size: this.steps.length,
                    current: i,
                    direction: 0,
                    height: window.dinglj.iv.getOneHeight(stepContainer),
                    qty: window.dinglj.iv.getScrollQty(i, limit, 0),
                    lineChanged: lineChanged,
                });
            }
        },
        doScroll(prop) {
            const next = prop.current + prop.direction;
            if (!prop.lineChanged && this.current == next) {
                return;
            } else if (next < 0) {
                dinglj.msg.send(this, 'toPrevLine', {});
            } else if (next >= this.steps.length) {
                dinglj.msg.send(this, 'toNextLine', {});
            } else {
                dinglj.byId('step-container').scrollTo(0, prop.height * prop.qty);
                this.last = this.current;
                this.current = next;
                dinglj.msg.send(this, 'change-img', `1/${ this.line }/${ this.steps[next] }`);
            }
            if (prop.lineChanged) {
                this.last = -1;
            }
            dinglj.msg.send(this, 'change-active-panel', 'step');
        }
    },
    computed: {
        steps(){
            if (this.line.trim() == '') {
                return [];
            }
            if (this.map[this.line]) {
                return this.map[this.line];
            }
            if (window.readSteps) {
                const result = window.readSteps(this.line);
                this.map[this.line] = result;
                return result;
            }
            const regExp = /.*\.png">(.*.png)<\/a>.*/;
            const response = dinglj.get(`${ window.location.href }1/${ this.line }`);
            const stepNumbers = response.split('\n');
            const result = stepNumbers.map(step =>  regExp.test(step) ? regExp.exec(step)[1] : '')
                .filter(href => href != '')
                .map(href => href.replace(/\/$/, ''));
            this.map[this.line] = result;
            return result;
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