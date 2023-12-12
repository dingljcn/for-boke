/** 横向滚动面板, 可与 tabpanel 结合, 实现点击哪个 tab 页, 就滚动到哪里的功能 (只是示例, 也可另作他用) */
export default {
    template: `<div class="dinglj-v-row-scroll" :id="id" :style="getStyle">
        <slot></slot>
    </div>`,
    data() {
        return {
            id: dinglj.uuid('row-scroll')
        }
    },
    props: {
        currentIdx: Number,
        size: Number
    },
    computed: {
        getStyle() {
            const result = {
                'left': `-${ this.getIdx >= 0 ? this.getIdx : 0 }00%`,
                'width': `${ this.size }00%`
            };
            return result;
        },
        getIdx() {
            return this.currentIdx >= 0 && this.currentIdx < this.size ? this.currentIdx : 0;
        }
    },
}