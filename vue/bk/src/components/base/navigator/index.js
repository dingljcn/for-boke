/** 导航菜单, 传入需要显示的目录名称 */
export default {
    template: `<div id="dinglj-v-navigator">
        <div class="dinglj-v-navigator-item" 
            v-for="item in menus" 
            @click="current = item; $emit('on-change', currentData)"
            :class="{'active': currentData == item }">
            {{ item }}
        </div>
    </div>`,
    data() {
        return {
            current: null
        }
    },
    mounted() {
        if (this.menus && this.menus.length > 0) {
            this.$emit('on-change', this.current);
        }
    },
    props: {
        menus: {
            type: Array,
            default: [],
            required: true
        }
    },
    computed: {
        currentData() {
            if (this.current) {
                if (this.menus.includesIgnoreCase(this.current)) {
                    return this.current; // 缓存中的当前模块还存在, 直接返回
                } else if (this.menus.length > 0) {
                    this.current = this.menus[0];
                    return this.current; // 否则重新制定第一个为当前模块
                }
            } else if (this.menus.length > 0) {
                this.current = this.menus[0];
                return this.current;
            }
            return null;
        }
    }
}