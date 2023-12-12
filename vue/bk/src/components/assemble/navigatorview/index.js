import navigator from '../../base/navigator/index.js';
import columnscroll from '../../base/columnscroll/index.js';

export default {
    template: `<div class="dinglj-v-navigator-view">
        <navigator style="margin-right: 10px" :menus="list" :getValue="getValue" @on-change="data => { current = data; $emit('on-change', data); }"></navigator>
        <div class="dinglj-v-navigator-right">
            <slot name="before"></slot>
            <div class="dinglj-v-navigator-content">
                <columnscroll :current-idx="list.map(i => getValue(i)).indexOf(current)" :size="list.length">
                    <slot name="content"></slot>
                </columnscroll>
            </div>
            <slot name="after"></slot>
        </div>
    </div>`,
    data() {
        return {
            current: ''
        }
    },
    props: {
        list: {
            type: Array,
            default: [],
            required: true,
        },
        getValue: {
            type: Function,
            default: item => item,
        }
    },
    components: {
        navigator,
        columnscroll
    }
}