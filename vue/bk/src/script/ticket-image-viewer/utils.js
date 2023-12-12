import { RightMenu } from '../../entity/RightMenu.js';

const object = {};

defunc(object, 'getActivePanel', function() {
    let activePanel = dinglj.byClass('arrow active');
    if (!activePanel) {
        activePanel = dinglj.byClass('step arrow')[0];
        activePanel.classList.add('active');
    } else {
        activePanel = activePanel[0];
    }
    return activePanel;
});

defunc(object, 'getOneHeight', function() {
    return object.getOneHeight(object.getActivePanel());
});

defunc(object, 'getOneHeight', function(activePanel) {
    if (activePanel.children.length == 0) {
        return 0;
    }
    const child = activePanel.children[0];
    return parseInt(getComputedStyle(child).margin) + child.offsetHeight;
});

defunc(object, 'getLimit', function() {
    const activePanel = object.getActivePanel();
    const height = object.getOneHeight(activePanel);
    return object.getLimit(activePanel, height);
});

defunc(object, 'getLimit', function(activePanel) {
    const height = object.getOneHeight(activePanel);
    return object.getLimit(activePanel, height);
});

defunc(object, 'getLimit', function(activePanel, height) {
    return parseInt(parseInt(activePanel.parentNode.offsetHeight / height) / 2);
});

defunc(object, 'getScrollQty', function(direction) {
    const activePanel = object.getActivePanel();
    const height = object.getOneHeight(activePanel);
    const current = object.getCurrentIndex(activePanel, -1);
    const limit = object.getLimit(activePanel, height);
    return object.getScrollQty(current, limit, direction);
});

defunc(object, 'getScrollQty', function(activePanel, direction) {
    const height = object.getOneHeight(activePanel);
    const current = object.getCurrentIndex(activePanel, -1);
    const limit = object.getLimit(activePanel, height);
    return object.getScrollQty(current, limit, direction);
});

defunc(object, 'getScrollQty', function(current, limit, direction) {
    return current < limit ? 0 : (current + direction - limit);
});

defunc(object, 'getCurrentIndex', function() {
    const activePanel = object.getActivePanel();
    return object.getCurrentIndex(activePanel, -1);
});

defunc(object, 'getCurrentIndex', function(activePanel) {
    return object.getCurrentIndex(activePanel, -1);
});

defunc(object, 'getCurrentIndex', function(activePanel, current) {
    if (current == -1) {
        current = dinglj.indexOfChildByClass(activePanel, 'active');
    }
    if (current == -1) {
        current = dinglj.indexOfChildByClass(activePanel, 'last');
    }
    if (current == -1) {
        current = 0;
    }
    return current;
});

defunc(object, 'getScrollProp', function(direction) {
    const activePanel = object.getActivePanel();
    return object.getScrollProp(activePanel, direction);
});

defunc(object, 'getScrollProp', function(activePanel, direction) {
    const index = object.getCurrentIndex(activePanel, -1);
    const height = object.getOneHeight(activePanel);
    const limit = object.getLimit(activePanel, height);
    const qty = object.getScrollQty(index, limit, direction);
    return {
        current: index,
        height: height,
        limit: limit,
        qty: qty,
        size: activePanel.children.length,
        direction: direction,
    }
});

const userConfig = window.readConfig();

const defaultConfig = window.defaultConfig();

const hotKey = dinglj.getConfigOrDefault(userConfig, defaultConfig, 'hotKey', {});

const keys = Object.values(hotKey).map(i => i.toUpperCase());

window.addEventListener('keydown', e => {
    let keyCode = e.code;
    keyCode = keyCode.replace(/^(Key)|(Digit)|(Numpad)/, '');
    if (keyCode == 'ArrowDown' || keyCode == 'ArrowUp') {
        e.preventDefault();
        const activePanel = object.getActivePanel();
        const direction = keyCode == 'ArrowDown' ? 1 : -1;
        const prop = object.getScrollProp(activePanel, direction);
        if (activePanel.classList.contains('line')) {
            dinglj.msg.send(this, 'update-line', prop);
        } else if (activePanel.classList.contains('step')) {
            dinglj.msg.send(this, 'update-step', prop);
        } else if (activePanel.classList.contains('history')) {
            dinglj.msg.send(this, 'update-history', prop);
        }
    } else if (keyCode == 'ArrowLeft' || keyCode == 'ArrowRight') {
        e.preventDefault();
        const direction = keyCode == 'ArrowRight' ? 1 : -1;
        dinglj.msg.send(window, 'change-panel', direction); 
    } else if (keyCode == 'AltLeft' || keyCode == 'AltRight') {
        dinglj.alt = true;
    } else if (keys.includes(keyCode) && dinglj.alt) {
        for(let key of Object.keys(hotKey)) {
            if (hotKey[key] == keyCode) {
                switch(key) {
                    case 'back': window.open('..'); break;
                    case 'addStar': dinglj.msg.send(window, 'add-star', null); break;
                    case 'cleanStar': dinglj.msg.send(window, 'clean-star', null); break;
                    case 'cleanHistory': dinglj.msg.send(window, 'clean-history', null); break;
                    case 'downloadCase': window.open('test.xls'); break;
                    case 'defaultStep': window.open('默认步骤'); break;
                    case 'erpLog': window.open('erpLog'); break;
                    case 'logs': window.open('logs'); break;
                    case 'line': dinglj.msg.send(window, 'focus-line', null); break;
                    case 'step': dinglj.msg.send(window, 'focus-step', null); break;
                }
            }
        }
    }
});


window.addEventListener('keyup', e => {
    if (e.code == 'Alt') {
        dinglj.alt = false;
    }
});

dinglj.iv = object;


export function buildImageRightMenu(that, id, src) {
    dinglj.timer(() => {
        const target = dinglj.byId(id);
        if (target != undefined) {
            dinglj.registRightClick(target, id, {
                items: [
                    id == 'main-image' ? new RightMenu('关注', () => that.addStar(src)) : undefined,
                    id == 'main-image' ? undefined : new RightMenu('取消关注', () => {
                        if (that.stars.remove(src)) {
                            '图片已取消关注'.info();
                        } else {
                            '未找到需要取消关注的图片'.warn();
                        }
                    }),
                ]
            });
            return true;
        }
        return false;
    });
}