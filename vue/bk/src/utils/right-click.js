defunc(window.dinglj, 'registRightClick', (target, name, config) => {
    const id = `right-click-menu-${ name }`;
    target.addEventListener('contextmenu', function (e) {
        for (let menu of dinglj.byClass('right-menu')) {
            menu.remove();
        }
        e.preventDefault();
        const menu = buildMenu(config);
        menu.id = id;
        menu.classList.add('right-menu');
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        document.body.appendChild(menu);
    });
});

document.addEventListener('click', function () {
    for (let menu of dinglj.byClass('right-menu')) {
        menu.remove();
    }
});

function buildMenu(config) {
    let rightClickMenu = document.createElement('div');
    let list = dinglj.getConfig(config, 'items', []); // config 都要在 config 里指定一个 items(数组) 属性
    for (let item of list) {
        if (!item) {
            continue;
        }
        let element = document.createElement('div');
        element.id = item.id;
        element.classList.add('right-click-item');
        element.innerText = item.label;
        element.addEventListener('click', item.event);
        rightClickMenu.appendChild(element);
    }
    return rightClickMenu;
}