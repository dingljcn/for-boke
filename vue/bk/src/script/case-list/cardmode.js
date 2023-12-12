export default {
    template: `<div class="mode-container card">
        <div class="case-list-status-page" v-for="statusName in statusNames">
            <div :class="'case-list-card ' + _case_.status.en.toLowerCase()" :style="{ '--cnt': cardCnt }" v-for="_case_ in groupData[statusName]">
                <div class="card-line card-title">
                    <div class="card-ticket" v-if="_case_.ticket" @click="openCardTicket(_case_)">#{{ _case_.ticket }}</div>
                    <div :class="_case_.status.en.toLowerCase()" v-else>{{ _case_.status.en }}</div>
                    <div class="card-name" :title="_case_.caseName">{{ _case_.caseName.replace(/^2.0[-_]/, '').replace(/\.[xX][lL][sS][xX]?$/, '') }}</div>
                </div>
                <div class="card-line card-percent" v-if="['ticket','running'].includesIgnoreCase(_case_.status.en)">
                    <progressx :style="{ '--bg': 'ticket'.equalsIgnoreCase(_case_.status.en) ? 'red' : 'rgb(180,180,180)' }" class="card-line-item" :caption="lineCaption(_case_)" :percent="linePercent(_case_)"></progressx>
                    <progressx :style="{ '--bg': 'ticket'.equalsIgnoreCase(_case_.status.en) ? 'red' : 'rgb(180,180,180)' }" class="card-line-item" :caption="stepCaption(_case_)" :percent="stepPercent(_case_)"></progressx>
                </div>
                <div class="card-line card-time-cost" v-if="['ticket'].includesIgnoreCase(_case_.status.en)">
                    <div>耗时: {{ _case_.timeCost }}</div>
                </div>
            </div>
        </div>
    </div>`,
    methods: {
        openCardTicket(_case_) {
            window.open(`${ dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'urls.ticket', '', false) }/${ _case_.ticket }`, `#${ _case_.ticket }`)
        },
        lineCaption(_case_) {
            return `行进度: ${ _case_.currentRow }/${ _case_.totalRow }, `;
        },
        linePercent(_case_) {
            return `${ (_case_.totalRow ? (_case_.currentRow / _case_.totalRow * 100).toFixed(2) : 0) }%`;
        },
        stepCaption(_case_) {
            return `步数进度: ${ _case_.currentStep }/${ _case_.totalStep }, `;
        },
        stepPercent(_case_) {
            return `${ (_case_.totalStep ? (_case_.currentStep / _case_.totalStep * 100).toFixed(2) : 0) }%`;
        }
    },
    computed: {
        config() {
            return window.readConfig();
        },
        defaultConfig() {
            return window.defaultConfig();
        }
    },
    props: {
        groupData: Object,
        statusNames: {
            type: Array,
            default: []
        },
        cardCnt: {
            type: Number,
            default: 5
        },
    }
}