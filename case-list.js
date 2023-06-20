function run(config) {
    // 引入通用脚本
    let utilScript = document.createElement('script');
    utilScript.type = 'text/javascript';
    utilScript.src = 'https://dingljcn.github.io/for-boke/utils.js?' + Math.random();
    // 脚本加载完成之后读取开始读配置, 启动脚本
    utilScript.onload = () => {
        console.log('传入的配置项: ')
        console.log(config);
    };
    document.head.appendChild(utilScript);
}
