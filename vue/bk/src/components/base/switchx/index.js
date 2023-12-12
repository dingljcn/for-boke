export default {
    template: `<div class="dinglj-v-switch" @click="onclicked" :style="getStyle()">
        <div class="dinglj-v-switch-pre">
            {{ preText }}
        </div>
        <div :class="getClass()">
            <div></div>
        </div>
        <div class="dinglj-v-switch-post">
            {{ postText }}
        </div>
    </div>`,
    data() {
        return {
            active: false
        }
    },
    props: {
        xSize: {
            type: String,
            default: 'normal'
        },
        preText: '',
        postText: ''
    },
    methods: {
        getStyle() {
            const result = {
                '--width': this.size.equalsIgnoreCase('small') ? '30px' : (this.size.equalsIgnoreCase('normal') ? '35px' : '40px'),
                '--height': this.size.equalsIgnoreCase('small') ? '24px' : (this.size.equalsIgnoreCase('normal') ? '28px' : '32px'),
                '--contrl-padding-tb': this.size.equalsIgnoreCase('small') ? '5px' : (this.size.equalsIgnoreCase('normal') ? '7px' : '8px'),
            };
            return result;
        },
        getClass() {
            const result = {
                'dinglj-v-switch-btn': true,
                'active': this.active
            };
            return result;
        },
        onclicked() {
            this.active = !this.active;
            this.$emit('on-change', this.active);
            if (this.active) {
                if (this.postText) {
                    `已切换: ${ this.postText }`.info();
                }
            } else {
                if (this.preText) {
                    `已切换: ${ this.preText }`.info();
                }
            }
        }
    },
    computed: {
        size() { // 按钮大小
            return ['small', 'normal', 'big'].includesIgnoreCase(this.xSize) ? this.xSize : 'normal';
        }
    },
}