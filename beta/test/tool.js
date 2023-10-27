const context_004 = {
    config: {},
    rt: {
        tickets: [],
    },
    fields: {
        origin: ['id', 'priority', 'owner', 'create_time', 'modify_time', 'from_create', 'to_end', 'component', 'summary', 'status'], /* 变更报表原字段顺序 */
        display: ['id', 'summary', 'status', 'priority', 'component', 'owner', 'create_time', 'modify_time', 'from_create', 'to_end'], /* 要显示的字段顺序 */
        zhCN: ['变更号', '概述', '状态', '优先级', '模块', '属主', '创建时间', '修改时间', '已创建天数', '截至上次修改天数'], /* 要显示的字段顺序名称 */
    }
}

/** 选择了组件, 如果已经激活, 则取消激活, 未激活则激活 */
function doSelectComponents(id) {
    let element = getById(id);
    if (element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
    invokeRefresh_004();
}
