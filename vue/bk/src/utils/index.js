import './overload.js';
import './extensions.js';
import './msg-queue.js';
import './msg-tips.js';
import './modal.js';
import './right-click.js';

import { createApp } from './vue.js';
import columnscroll from '../components/base/columnscroll/index.js';
import rowscroll from '../components/base/rowscroll/index.js';
import navigator from '../components/base/navigator/index.js';
import navigatorview from '../components/assemble/navigatorview/index.js';
import tabpanel from '../components/base/tabpanel/index.js';
import tabpanelview from '../components/assemble/tabpanelview/index.js';
import btn from '../components/base/btn/index.js';
import tablex from '../components/base/tablex/index.js';
import switchx from '../components/base/switchx/index.js';
import inputx from '../components/base/inputx/index.js';
import combo from '../components/base/combo/index.js';
import progress from '../components/base/progress/index.js';

/** 创建 Vue 应用, 并注册组件, 完成挂载对象 */
window.createVue = function(object, id) {
    const app = createApp(object);
    app.component('columnscroll', columnscroll)
        .component('rowscroll', rowscroll)
        .component('navigator', navigator)
        .component('navigatorview', navigatorview)
        .component('tabpanel', tabpanel)
        .component('tabpanelview', tabpanelview)
        .component('btn', btn)
        .component('tablex', tablex)
        .component('inputx', inputx)
        .component('combo', combo)
        .component('progressx', progress)
        .component('switchx', switchx);
    app.mount(id);
};

