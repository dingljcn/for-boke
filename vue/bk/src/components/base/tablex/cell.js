export default {
    template: `<div class="dinglj-v-cell" :style="{ width: bestWidth + 'px' }">
        <slot></slot>
    </div>`,
    props: {
        bestWidth: {
            type: Number,
            default: 80
        }
    }
}