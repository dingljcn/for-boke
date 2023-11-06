/** 基本 url */
const baseURL = 'https://dingljcn.github.io/for-boke/js'
/** 测试版本 */
const dev = 'dev';
/** 正式版本 */
const deploy = 'deploy';
/** 脚本 */
class D_Script {
    name; version; starter; scripts; css;
    constructor(name = '', version = 0.1, starter = '', scripts = [], css = []) {
        this.name = name;
        this.version = version;
        this.starter = starter;
        this.scripts = scripts;
        this.css = css;
    }
    loadScripts(env = dev, config = {}) {
        this.loadScript(this.scripts, env, config, 'script'); // load 所有脚本
        this.loadScript(this.css, env, config, 'link'); // load 所有样式
    }
    loadScript(elements = [], env, config, type) {
        let that = this;
        for (let item of elements) {
            let newElement = document.createElement(type);
            document.head.appendChild(newElement);
            if (type == 'script') {
                let url = `${ baseURL }/${ env }/${ item.url }`;
                let fullUrl = `${ url }?version=${ this.version }`;
                newElement.type = 'text/javascript';
                newElement.src = fullUrl;
                newElement.onload = function () {
                    localStorage.setItem(url, fullUrl);
                    that.loadScript(item.subs, env, config, type); // 加载后续脚本
                }
                newElement.onerror = function () {
                    let lastUrl = localStorage.getItem(url);
                    if (lastUrl && lastUrl != fullUrl) { // 取上一个成功的缓存版本
                        that.loadScript([ lastUrl ], env, config, type);
                    }
                }
            } else if (type == 'link') {
                newElement.rel = 'stylesheet';
                newElement.type = 'text/css';
                newElement.href = `${ baseURL }/${ env }/${ item.url }?version=${ this.version }`;
            }
            document.head.appendChild(newElement);
        }
    }
}
/** 脚本/样式 */
class D_Element {
    url; subs;
    constructor(url = '', subs = []) {
        this.url = url;
        this.subs = subs;
    }
}
const scripts = {
    '回归测试报表': new D_Script('回归测试报表', 0.1, 'run_test_report', [
        new D_Element('test/index.js'),
        new D_Element('test/tool.js'),
        new D_Element('element.js'),
        new D_Element('scripts.js'),
        new D_Element('typedef.js'),
    ], [
        new D_Element('test/index.css')
    ]),
}

function loadScript(name, env, config = {
    matchList: [], // 允许匹配的 url 数组, 正则表达式
    customStyle: '', // 自定义的 css 样式
    configBuilder: () => {}, // 其他配置项的生成器
}) {
    console.log(config);
    if (!isMatch(config)) {
        console.error(`脚本 [${ name }] 不允许在当前地址执行`);
        return;
    }
    if (!Object.keys(scripts).includes(name)) {
        console.error(`不存在的脚本 [${ name }]`);
        return;
    }
    // 加载需要的脚本或样式
    scripts[name].loadScripts(env, config);
    // 如果用户自定义了样式, 则将其添加到 style 标签中
    let customStyle = document.createElement('style');
    customStyle.innerHTML = config.customStyle;
    document.head.appendChild(customStyle);
    // 最后调用启动函数
    window[scripts[name].starter](config.configBuilder());
}

/** 判断当前网址是否启用脚本 */
function isMatch(config) {
    if (config.matchList && config.matchList.length > 0) {
        // 如果存在要匹配的网址, 则匹配, 匹配成功才进入
        for (let stratege of config.matchList) {
            if (stratege.test(window.location.href)) {
                return true;
            }
        }
    } else {
        // 如果没有要匹配的网址, 默认是允许执行脚本
        return true;
    }
    // 到这里说明存在要匹配的网址, 但匹配失败, 返回 false
    return false;
}