export default {
    template: `<div class="dinglj-v-progress-bar" :id="id">
        <span :class="{ 'dinglj-v-progress-caption': true, 'top': true, 'right': position == 'rt' }" v-if="['lt', 'rt'].includesIgnoreCase(position)">{{ caption }}{{ percent }}</span>
        <div class="dinglj-v-progress-box" :style="getContainerStyle()">
            <div class="dinglj-v-progress" :style="getProgressStyle()"></div>
        </div>
        <span :class="{ 'dinglj-v-progress-caption': true, 'bottom': true, 'right': position == 'rb' }" v-if="['lb', 'rb'].includesIgnoreCase(position)">{{ caption }}{{ percent }}</span>
    </div>`,
    mounted() {
        this.$emit('mounted', this.id);
    },
    data() {
        return {
            id: dinglj.uuid('progress-bar'),
        }
    },
    methods: {
        getContainerStyle() {
            return {
                '--bar-height': this.height,
            }
        },
        getProgressStyle() {
            setTimeout(() => {
                const container = dinglj.byId(this.id);
                const box = dinglj.findChildrenByClass(container, 'dinglj-v-progress-box')[0];
                box.children[0].style.width = this.percent;
            }, 100)
            return {
                'width': '0%',
            }
        }
    },
    props: {
        height: {
            type: String,
            default: '5px',
        },
        percent: {
            type: String,
            default: '100%',
            required: true,
        },
        position: {
            type: String, // left-top, left-bottom, right-top, right-bottom
            default: 'lt',
        },
        caption: {
            type: String,
            default: '',
        }
    }
}