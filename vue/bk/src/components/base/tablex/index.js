import cell from "./cell.js";

/** 表格, 传入 [ { label, value } ] 形式的表头列名, 再传入要显示的数据列表即可 */
export default {
    template: `<div class="dinglj-v-table" :id="id">
        <div class="dinglj-v-thead dinglj-v-tr">
            <cell v-if="selectable" class="dinglj-v-table-select" @click="doCheckAll">
                <input type="checkbox" :checked="checkAll"/>选择
            </cell>
            <cell v-if="processNum" class="dinglj-v-table-sequence">
                序号
            </cell>
            <cell v-for="column in columns" :best-width="bestWidth[getValue(column)]" :class="getClass(column)">
                {{ getLabel(column) }}
            </cell>
        </div>
        <div class="dinglj-v-tbody">
            <div>
                <div class="dinglj-v-tr" v-for="(line, idx) in data" @click="checkOne(line)">
                    <cell v-if="selectable" class="dinglj-v-table-select">
                        <input type="checkbox" :checked="checkList.includes(line)"/>
                    </cell>
                    <cell v-if="processNum" class="dinglj-v-table-sequence">
                        {{ idx + 1 }}
                    </cell>
                    <cell :best-width="bestWidth[getValue(column)]" :class="getClass(column)" v-for="column in columns">
                        {{ getCell(line, getValue(column)) }}
                    </cell>
                </div>
            </div>
        </div>
    </div>`,
    data() {
        return {
            checkAll: false,
            checkList: [],
            id: dinglj.uuid('table-v'),
            cache: {
                bestWidth: {},
                cellClass: {},
            }
        }
    },
    mounted() {
        this.$emit('on-loaded', this.id);
    },
    methods: {
        doCheckAll() {
            this.checkList.length = 0; // 直接清空
            if (!this.checkAll) { // 当前不是全选, 表示接下来要全选, 全部加入
                this.checkList.push(...this.data);
            }
            this.checkAll = !this.checkAll;
        },
        checkOne(line) {
            if (this.checkList.includes(line)) {
                this.checkList.remove(line);
                this.checkAll = false;
            } else {
                this.checkList.push(line);
                if (this.checkList.length == this.data.length) {
                    this.checkAll = true;
                }
            }
        },
        getClass(column) {
            if (this.cache.cellClass[this.getValue(column)]) {
                return this.cache.cellClass[this.getValue(column)];
            }
            let flex = this.flexColumns.includesIgnoreCase(this.getValue(column)) ? 'flex' : 'fixed';
            const result = {};
            result[this.getValue(column)] = true;
            result[flex] = true;
            this.cache.cellClass[this.getValue(column)] = result;
            return result;
        }
    },
    computed: {
        bestWidth() {
            let result = {};
            // 一列一列分别计算宽度
            for (let column of this.columns) {
                // 计算本列的标题宽度
                const columnKey = this.getValue(column);
                const columnTitle = this.getLabel(column);
                let titleWidth = dinglj.calcTxtWidth(columnTitle);
                let widthArray = [ titleWidth ];
                // 计算本列的每一行宽度
                widthArray.push(
                    ...this.data.map(e => {
                        const columnContent = this.getCell(e, columnKey);
                        return dinglj.calcTxtWidth(columnContent);
                    })
                );
                const maxWidth = Math.max(...widthArray);
                result[columnKey] = maxWidth + 30;
            }
            return result;
        },
    },
    props: {
        columns: Array,
        data: Array,
        selectable: {
            type: Boolean,
            default: true,
        },
        processNum: {
            type: Boolean,
            default: true,
        },
        flexColumns: {
            type: Array,
            default: []
        },
        getLabel: {
            type: Function,
            default: i => i.label
        },
        getValue: {
            type: Function,
            default: i => i.value
        },
        getCell: {
            type: Function,
            default: (_case_, column) => '' + _case_[column]
        }
    },
    components: {
        cell
    }
}