export default {
    template: `
        <div class="dinglj-v-ctl dinglj-v-input text" :caption="caption" :style="getStyle()" :id="id">
            <input type="text" :placeholder="placeholder" v-model="value" @input="setValue(value, 'input')" @blur="setValue(value, 'change')" @change="setValue(value, 'change')"/>
            <div class="clean" @click="setValue('', 'change')">×</div>
        </div>`,
    mounted() {
        this.$emit('mounted', this.id);
        dinglj.msg.on('dinglj-v-input-text::clear', this.id, () => this.value = '');
        dinglj.msg.on('dinglj-v-input-text::focus', this.id, () => dinglj.byId(this.id).children[0].focus());
    },
    data() {
        return {
            id: dinglj.uuid('input'),
            value: this.defaultValue,
        }
    },
    props: {
        caption: String,
        placeholder: String,
        xSize: {
            type: String,
            default: 'normal'
        },
        defaultValue: String,
    },
    methods: {
        setValue(n, event) {
            this.value = n;
            this.$emit(`on-${ event }`, {
                value: n,
                id: this.id,
            });
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
    },
}