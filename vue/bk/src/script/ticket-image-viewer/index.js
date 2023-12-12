import './read-config.js';
import '../../utils/index.js';
import './utils.js';
import ivline from './line.js';
import ivstep from './step.js';
import ivhistory from './history.js';
import { buildImageRightMenu } from './utils.js';

dinglj.remCss();
dinglj.linkCss('assets/css/utils.css');
dinglj.linkCss('assets/css/vue.css');
dinglj.linkCss('src/script/ticket-image-viewer/index.css');
dinglj.injectUserCss();

document.body.innerHTML = `<div id="dinglj-main">
    <div id="iv-toolbar">
        <div id="iv-options">
            <div @click="window.open('..')">返回上一层({{ hotKey.back }})</div>
            <div @click="addStar(display)">添加关注({{ hotKey.addStar }})</div>
            <div @click="stars.length = 0">清空关注({{ hotKey.cleanStar }})</div>
            <div @click="history.length = 0">清空历史({{ hotKey.cleanHistory }})</div>
            <div @click="window.open('test.xls')">下载用例({{ hotKey.downloadCase }})</div>
            <div @click="window.open('默认步骤')">默认步骤({{ hotKey.defaultStep }})</div>
            <div @click="window.open('erpLog')">下载用例({{ hotKey.erpLog }})</div>
            <div @click="window.open('logs')">下载用例({{ hotKey.logs }})</div>
        </div>
        <div class="flex"></div>
        <inputx :placeholder="'输入行数进行跳转(' + hotKey.line + ')'" @on-change="jumpLine" @mounted="emit => ids.lineInput = emit"></inputx>
        <inputx :placeholder="'输入步数进行跳转(' + hotKey.step + ')'" @on-change="jumpStep" @mounted="emit => ids.stepInput = emit"></inputx>
    </div>
    <div id="iv-under-toolbar">
        <ivline :arrow="arrow"></ivline>
        <ivstep :arrow="arrow"></ivstep>
        <div class="content-view flex">
            <tabpanelview :names="tabNames" @mounted="tabPanelViewMounted">
                <div v-for="(src, idx) of images" style="width: 100%; height: 100%; position: relative">
                    <img :id="getImageId(src, idx)" :src="src"/>
                </div>
            </tabpanelview>
        </div>
        <ivhistory :arrow="arrow" @on-clicked="data => { display = data; }" :list="history" :tab-panel-id="ids.tabPanelView"></ivhistory>
    </div>
</div>`;

createVue({
    data() {
        return {
            arrow: 'step', // line, step, history
            idx: {
                line: '',
                step: '',
            },
            display: '',
            stars: [],
            history: [],
            imageIds: {},
            init: {
                tabPanelView: true,
            },
            ids: {
                lineInput: '',
                stepInput: '',
                tabPanelView: '',
            }
        }
    },
    mounted() {
        /** 快捷键快捷键切换面板 */
        dinglj.msg.on('change-panel', (that, direction) => {
            this.changePanel(direction);
        })
        /** 快捷键添加关注图片 */
        dinglj.msg.on('add-star', () => {
            this.addStar(this.display);
        });
        /** 快捷键清空关注图片 */
        dinglj.msg.on('clean-star', () => {
            this.stars.length = 0;
        });
        /** 快捷键清空历史记录 */
        dinglj.msg.on('clean-history', () => {
            this.history.length = 0;
        });
        /** 切换活动面板 */
        dinglj.msg.on('change-active-panel', (that, data) => {
            this.arrow = data;
        });
        /** 快捷键聚焦行输入框 */
        dinglj.msg.on('focus-line', (that) => {
            dinglj.msg.send(this, 'dinglj-v-input-text::focus', this.ids.lineInput, null);
        });
        /** 快捷键聚焦步输入框 */
        dinglj.msg.on('focus-step', (that) => {
            dinglj.msg.send(this, 'dinglj-v-input-text::focus', this.ids.stepInput, null);
        });
        /** 快捷键更新图片路径 */
        dinglj.msg.on('change-img', (that, img) => {
            this.history.pushNew(img);
            this.display = img;
        });
    },
    methods: {
        /** Tab面板加载事件, 为其绑定 Tab 键切换 Tab 页事件 */
        tabPanelViewMounted(id) {
            this.ids.tabPanelView = id;
            if (this.init.tabPanelView) {
                this.init.tabPanelView = false;
                window.addEventListener('keydown', e => {
                    if (e.code == 'Tab') {
                        e.preventDefault();
                        dinglj.msg.send(this, 'tab-view:next', id, null);
                    }
                });
            }
        },
        /** 跳转至指定行 */
        jumpLine(data) {
            dinglj.msg.send(this, 'jumpToLine', data.value);
            dinglj.msg.send(this, 'dinglj-v-input-text::clear', data.id, null);
        },
        /** 跳转至指定步骤 */
        jumpStep(data) {
            dinglj.msg.send(this, 'jumpToStep', data.value);
            dinglj.msg.send(this, 'dinglj-v-input-text::clear', data.id, null);
        },
        /** 切换面板 */
        changePanel(direction) {
            const panels = dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'panels', []);
            const index = panels.indexOfIgnoreCase(this.arrow);
            const target = (index + panels.length + direction) % panels.length;
            this.arrow = panels[target];
        },
        /** 添加关注图片 */
        addStar(src) {
            if (this.stars.includesIgnoreCase(src)) {
                '无需重复关注'.warn();
            } else {
                this.stars.push(src);
            }
        },
        /** 获取图片ID, 并为其绑定右键菜单 */
        getImageId(src, idx) {
            let id = src;
            if (idx == 0) {
                id = 'main-image';
            }
            buildImageRightMenu(this, id, src);
            return id;
        }
    },
    computed: {
        config() {
            return window.readConfig();
        },
        defaultConfig() {
            return window.defaultConfig();
        },
        images() {
            const result = [];
            if (this.display) {
                result.push(this.display);
            }
            result.push(...this.stars);
            return result;
        },
        tabNames() {
            let result = ['当前图片'];
            for (let i = 1; i < this.images.length; i++) {
                result.push(this.images[i].replace(/1\/(\d+)\/(.*)(\.png)/, '第$1行: $2'));
            }
            return result;
        },
        hotKey() {
            return dinglj.getConfigOrDefault(this.config, this.defaultConfig, 'hotKey', {});
        }
    },
    components: {
        ivline, ivstep, ivhistory
    }
}, '#dinglj-main');