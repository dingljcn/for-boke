export default {
    template: `<div class="dinglj-v-ctl dinglj-v-input combo" :style="getStyle()" :caption="caption" :id="id">
        <input :placeholder="placeholder" type="text" v-model="display"/>
        <div class="clean" @click="setValue('', true)">×</div>
        <div class="dinglj-v-combo-selections">
            <div class="dinglj-v-combo-selection" v-for="item in values" @click="setValue(item, true)">
                {{ getLabel(item) }}
            </div>
        </div>
    </div>`,
    data() {
        return {
            id: 'combo',
            display: '',
            value: {},
        }
    },
    props: {
        values: { // 选项
            type: Array,
            default: [],
            required: true
        },
        getLabel: { // 用于获取要显示的文本
            type: Function,
            default: i => i.label
        },
        getValue: { // 用于获取实际值
            type: Function,
            default: i => i.value
        },
        caption: { // 字段名称
            type: String,
            default: '',
            required: true
        },
        xSize: {
            type: String,
            default: 'normal'
        },
        placeholder: String
    },
    watch: {
        display(newVal) {
            if (newVal.trim() == '') { // 空值直接返回
                this.setValue('', false);
                return;
            }
            for (let item of this.values) { // 遍历所有值, 先取 label 看是否有匹配的
                if (this.getLabel(item) == newVal) {
                    this.setValue(item, false);
                    return;
                }
            }
            for (let item of this.values) { // 遍历所有值, 再取 value 看是否有匹配的
                if (this.getValue(item) == newVal) {
                    this.setValue(item, false);
                    return;
                }
            }
            this.setValue('', false);
        }
    },
    methods: {
        /**
         * 设置 value 属性
         * @param {any} value 值
         * @param {boolean} isUpdateDisplay 是否更新 display 属性
         */
        setValue(value, isUpdateDisplay) {
            if (isUpdateDisplay) {
                if (value) {
                    this.display = this.getLabel(value);
                } else {
                    this.display = '';
                }
            }
            this.value = value;
            this.$emit('on-change', value);
        },
        getStyle() {
            const result = {
                '--height': this.size.equalsIgnoreCase('small') ? '24px' : (this.size.equalsIgnoreCase('normal') ? '28px' : '32px'),
                '--width': this.size.equalsIgnoreCase('small') ? '180px' : (this.size.equalsIgnoreCase('normal') ? '200px' : '220px'),
            };
            return result;
        }
    },
    computed: {
        size() { // 按钮大小
            return ['small', 'normal', 'big'].includesIgnoreCase(this.xSize) ? this.xSize : 'normal';
        }
    }
}