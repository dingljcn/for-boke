import './read-config.js';
import '../../utils/index.js';
import './entity/GroupStrategy.js';
import './entity/DataFilter.js';
import './entity/TabStrategy.js';
import vuefilter from './filter.js';
import { RightMenu } from '../../entity/RightMenu.js';

dinglj.linkCss('assets/css/utils.css');
dinglj.linkCss('assets/css/vue.css');
dinglj.linkCss('src/script/ticket-list/index.css');
dinglj.injectUserCss();
dinglj.remById('footer');

const mainElement = dinglj.byId('main');
if (mainElement) {
    for (let element of mainElement.children) {
        element.style.display = 'none';
    };
    mainElement.innerHTML += `<div id="dinglj-main">
        <navigatorview :list="groupNames">
            <template v-slot:before>
                <vuefilter :data="originData" @on-change="data => filter = data"></vuefilter>
            </template>
            <template class="result-view" v-slot:content>
                <tabpanelview v-for="groupName in groupNames" :names="this.tabNames(groupName)"
                    :get-name="k => k + '(' + tabData(groupName)[k].length + ')'">
                    <TableX v-for="tabName in tabNames(groupName)"
                        :columns="columnsToDisplay(groupName, tabName)"
                        :data="tabData(groupName)[tabName]"
                        :flex-columns="['summary']"
                        :get-cell="(t, c) => { if (this.newTickets.includes(t) && c == 'summary') { return '[new]' + t.summary } else { return t[c] } }"
                        @on-loaded="tableLoaded">
                    </TableX>
                </tabpanelview>
            </template>
            <template v-slot:after></template>
        </navigatorview>
    </div>`;
}

createVue({
    data() {
        return {
            constant: {
                myTickets: 'dinglj-v-my-tickets'
            },
            filter: {}
        }
    },
    mounted() {
        if (this.newTickets && this.newTickets.length > 0) {
            let msg = `你有 ${ this.newTickets.length } 个新变更, 注意查收
            <div style="margin-left: 5px; font-weight: bold; color: var(--theme-color); cursor: pointer" onclick="${
                this.newTickets.map(t => `window.open('${ this.ticketURL }/${ t.id.replace('#', '').trim() }');`).join('')
            }">全部打开</div>`;
            msg.info(5000, '2%');
        }
    },
    methods: {
        tableLoaded(id) {
            const list = dinglj.query(`#${ id } .dinglj-v-tbody .dinglj-v-cell.id`);
            list.forEach(element => {
                element.addEventListener('click', () => {
                    window.open(`${ this.ticketURL }/${ element.innerText.replace('#', '').trim() }`);
                    let owner = dinglj.findBroByClass(element, 'owner');
                    if (owner && owner.innerText == this.whoami) {
                        const storage = dinglj.getStorage(this.constant.myTickets, []);
                        if (!storage.includesByProp('id', element.innerText.trim())) {
                            storage.push(element.innerText.trim());
                            dinglj.setStorage(this.constant.myTickets, storage);
                        }
                    }
                })
            });
            const lines = dinglj.query(`#${ id } .dinglj-v-tbody .dinglj-v-tr`);
            for (let line of lines) {
                let idElement = dinglj.findChildrenByClass(line, 'id')[0];
                let summaryElement = dinglj.findChildrenByClass(line, 'summary')[0];
                let modalId = dinglj.uuid('modal');
                dinglj.registRightClick(line, id, {
                    items: [
                        new RightMenu('打开', () => {
                            window.open(`${ this.ticketURL }/${ idElement.innerText.replace('#', '').trim() }`);
                        }),
                        new RightMenu('复制描述', () => {
                            let idElement = dinglj.findChildrenByClass(line, 'summary')[0];
                            if (idElement) {
                                dinglj.copyTxt(idElement.innerText);
                            } else {
                                '未找到描述'.info();
                            }
                        }),
                        new RightMenu('显示更多信息', () => {
                            dinglj.showModal(this.moreInfoModal(idElement.innerText, summaryElement.innerText, modalId));
                        })
                    ]
                });
            }
        },
        tabData(groupName) {
            const groupData = this.groupData[groupName];
            const result = {};
            if (!groupData || groupData.length == 0) {
                return result;
            }
            const tabStrategys = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'strategy.tabBy', []);
            const rowFilters = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'strategy.rowFilter', []);
            for (let strategy of tabStrategys) {
                let tabName = '';
                let list = []
                // 首先根据规则, 将所有符合规则的变更找出来
                for (let ticket of groupData) {
                    let tmpName = strategy.exec(groupName, ticket);
                    if (tmpName) {
                        tabName = tmpName;
                        // 根据行过滤器进行二次判断
                        let ignore = false;
                        for (let filter of rowFilters) {
                            if (filter.exec(groupName, tabName, groupData, ticket)) {
                                ignore = true;
                                break
                            }
                        }
                        if (!ignore) {
                            list.push(ticket);
                        }
                    }
                }
                if (tabName && list.length > 0) {
                    result[tabName] = list;
                }
            }
            return result;
        },
        tabNames(groupName) {
            return Object.keys(this.tabData(groupName));
        },
        columnsToDisplay(groupName, tabName) {
            const tabData = this.tabData(groupName);
            if (!tabData) {
                return [];
            }
            const everyTab = tabData[tabName];
            if (!everyTab || everyTab.length == 0) {
                return [];
            }
            let columnKeys = [];
            const filters = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'strategy.colFilter', []);
            for (let column of Object.keys(everyTab[0])) {
                let ignore = false;
                for (const filter of filters) {
                    if (filter.exec(groupName, tabName, everyTab, null, column)) {
                        ignore = true;
                        break;
                    }
                }
                if (!ignore) {
                    columnKeys.push(column);
                }
            }
            return columnKeys.map(i => {
                return {
                    label: dinglj.getConfigOrDefault(this.config, this.defaultConfig, `constant.columns.${ i }.zh`, '', false),
                    value: i,
                }
            })
        },
        moreInfoModal(ticketId, ticketSummary, modalId) {
            return {
                id: modalId,
                title: `${ ticketId } ${ ticketSummary }`,
                style: {
                    width: '800px',
                    height: '400px',
                },
                btns: [
                    {
                        size: 'normal',
                        type: 'primary',
                        name: '确认',
                        event: modalId => {
                            dinglj.remById(modalId);
                        }
                    }
                ]
            };
        }
    },
    computed: {
        /** 获取配置 */
        config() {
            return window.readConfig();
        },
        defaultConfig() {
            return window.defaultConfig();
        },
        newTickets() {
            let list = dinglj.getStorage(this.constant.myTickets, []);
            return this.originData.filter(i => i.owner == this.whoami && !list.includesIgnoreCase(i.id));
        },
        groupColumn() {
            const regExp = /[?&]group=([a-zA-Z0-9]+)[?&]?/;
            let defaultValue = '';
            if(regExp.test(window.location.href)) {
                defaultValue = (regExp.exec(window.location.href))[1]; // url 参数
            }
            const defaultColumns = ['component', 'owner', 'status']; // 如果既没有配置, 也没有 url 参数, 则从这里面选一个存在的
            const columns = Object.keys(this.originData[0]); // 所有显示出来的列
            let groupColumn = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'groupBy', defaultValue, true, false);
            for (let tmp of defaultColumns) {
                if (columns.includesIgnoreCase(tmp)) {
                    groupColumn = tmp;
                    break;
                }
            }
            return groupColumn;
        },
        originData() {
            let result = [];
            if (dinglj.isDev()) {
                result = readData(); // 用于本地测试, 本地会通过这个方法提供数据
            } else {
                let columnConstants = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'constant.columns', '', false);
                let ticketClass = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'constant.ticketClass', '', false);
                const columnKeys = Object.keys(columnConstants);
                const unknownColumn = ['sel'];
                for (let className of ticketClass) {
                    for (let element of dinglj.byClass(className)) {
                        let ticket = {};
                        result.push(ticket);
                        for (let cell of element.children) {
                            const key = cell.className;
                            if (columnKeys.includesIgnoreCase(key)) {
                                ticket[key] = cell.innerText.trim();
                            } else if (!unknownColumn.includesIgnoreCase(key)) {
                                ('不存在的列' + key).warn();
                                unknownColumn.push(key);
                            }
                        }
                    }
                }
            }
            return result;
        },
        filterData() {
            if (this.originData.length == 0) {
                return [];
            }
            let result = this.originData;
            for (let column of Object.keys(this.originData[0])) {
                if (this.filter[column]) {
                    result = result.filter(i => i[column] == this.filter[column]);
                }
            }
            return result;
        },
        myTickets() {
            return this.filterData.filter(ticket => ticket.owner == this.whoami);
        },
        groupData() {
            if (this.filterData.length <= 0) {
                return {};
            }
            if (this.groupColumn) {
                const result = dinglj.groupBy(this.filterData, this.groupColumn);
                const fieldList = Object.keys(this.filterData[0]);
                const strategyList = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'strategy.groupBy', []);
                for (let ticket of this.filterData) {
                    for (let fieldKey of fieldList) {
                        for (let idx = strategyList.length - 1; idx >= 0; idx--) {
                            let groupName = strategyList[idx].exec(ticket, fieldKey);
                            if (groupName) {
                                if (!result[groupName] || !result[groupName].includes(ticket)) {
                                    dinglj.unshiftToObj(result, groupName, ticket);
                                }
                            }
                        }
                    }
                }
                return result;
            } else {
                '未找到任何用于分组的配置'.err();
                return {};
            }
        },
        groupNames() {
            if (this.groupData.length <= 0) {
                return [];
            }
            const result = Object.keys(this.groupData); // 所有分组名
            const order = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'strategy.order.group', {}, false); // 获取排序规则
            result.sort((o1, o2) => {
                return dinglj.compareStringByArray(order[this.groupColumn], o1, o2);
            })
            return result;
        },
        ticketURL() {
            return dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'urls.ticket', '');
        },
        whoami() {
            return dinglj.getConfig(this.config, 'whoami.zh', '', true);
        }
    },
    components: {
        vuefilter
    }
}, '#dinglj-main');