if (window.dingljenv == 'dev') {
    window.dinglj_home = 'C:/Users/dinglj/OneDrive/dingljcn/';
} else {
    window.dinglj_home = 'http://8.137.15.188:2245/bk-script/';
}

if (!window.readConfig) {
    window.readConfig = function() {
        return {};
    }
}

window.defaultConfig = function() {
    return {
        constant: {
            columns: {
                id: { en: 'id', zh: '变更号' },
                summary: { en: 'summary', zh: '概述' },
                status: { en: 'status', zh: '状态' },
                reporter: { en: 'reporter', zh: '报告人' },
                owner: { en: 'owner', zh: '属主' },
                type: { en: 'type', zh: '类型' },
                priority: { en: 'priority', zh: '优先级' },
                component: { en: 'component', zh: '组件' },
                resolution: { en: 'resolution', zh: '处理结果' },
                time: { en: 'time', zh: '创建时间' },
                changetime: { en: 'changetime', zh: '修改时间' },
                plandate: { en: 'plandate', zh: '计划日期' },
                pingtai: { en: 'pingtai', zh: '平台' },
                project: { en: 'project', zh: '项目' },
                ticketclass: { en: 'ticketclass', zh: '分类' },
                testadjust: { en: 'testadjust', zh: '测试调整' },
                testreport: { en: 'testreport', zh: '测试调整提出者' },
                testower1: { en: 'testower1', zh: '测试调整处理者' },
                keywords: { en: 'keywords', zh: '关键词' },
                cc: { en: 'cc', zh: '抄送' },
                version: { en: 'version', zh: '版本' }
            },
            ticketClass: ['prio1', 'prio2', 'prio3'],
        },
        urls: {
            ticket: 'http://dev.bokesoft.com:8000/trac/eri-erp/ticket'
        },
        strategy: {
            groupBy: [
                GroupStrategy((ticket, fieldKey) => {
                    if (ticket.reporter == '自动测试组') {
                        return '回归变更';
                    }
                    return '';
                }),
            ],
            tabBy: [
                TabPageStrategy(/.*/, 'reporter', '自动测试组', '回归变更'),
                TabPageStrategy(/回归变更/, (groupName, ticket) => {
                    return '所有变更';
                }, true)
            ],
            colFilter: [
                ColFilter(/我的变更/, /.*/, 'owner'),
                ColFilter(/.*/, /.*/, (groupName, tabName, list, column) => {
                    return list.filter(i => i[column].trim() != '').length == 0;
                })
            ],
            order: {
                group: {
                    component: ['我的变更', '回归变更', 'PP 生产', 'PM 工厂维护', 'MM 物料管理', 'SD 销售与分销', 'QM 质量管理', 'SRM SRM', 'WMS Integration'],
                }
            },
        },
    }
}
