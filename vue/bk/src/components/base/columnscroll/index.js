/** 竖向滚动面板, 可与 navigator 结合, 实现点击哪个菜单, 就滚动到哪里的功能 (只是示例, 也可另作他用) */
export default {
    template: `<div class="dinglj-v-column-scroll" :id="id" :style="getStyle()">
        <slot></slot>
    </div>`,
    data() {
        return {
            id: dinglj.uuid('column-scroll')
        }
    },
    props: {
        currentIdx: Number,
        size: Number
    },
    methods: {
        getStyle() {
            const result = {
                'top': `-${ this.currentIdx >= 0 ? this.currentIdx : 0 }00%`,
                'height': `${ this.size }00%`
            };
            return result;
        }
    }
}