/** 按钮 */
export default {
    template: `<div :class="getClass()" :id="id" :style="getStyle()" @click="$emit('on-click')">
        <slot></slot>
    </div>`,
    data() {
        return {
            id: dinglj.uuid('btn')
        }
    },
    props: {
        xType: {
            type: String,
            default: 'primary'
        },
        xSize: {
            type: String,
            default: 'normal'
        }
    },
    computed: {
        type() { // 按钮类型
            return ['primary', 'warn', 'error'].includesIgnoreCase(this.xType) ? this.xType : 'primary';
        },
        size() { // 按钮大小
            return ['small', 'normal', 'big'].includesIgnoreCase(this.xSize) ? this.xSize : 'normal';
        }
    },
    methods: {
        getClass() {
            const result = {
                'dinglj-v-btn': true, 
                'dinglj-v-ctl': true,
                'primary': this.type.equalsIgnoreCase('primary')
            };
            return result;
        },
        getStyle() {
            return dinglj.styleForBtn(this.size);
        }
    }
}