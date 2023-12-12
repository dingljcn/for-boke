
/** 删除消息提示 */
function distoryPopMsg(element, container) {
    if (!element) {
        return;
    }
    element.style.height = '0px';
    element.style.opacity = 0;
    element.style.padding = 0;
    element.style.marginBottom = 0;
    setTimeout(() => {
        element.remove();
        if (container && container.children.length == 0) {
            container.remove();
        }
    }, 300)
}

/** 创建消息提示 */
function createPopMsg(msg, type = 'info', timeout = 2000, marginTop = '10%') {
    let container = dinglj.byId('pop-msg-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'pop-msg-container';
        document.body.appendChild(container);
    }
    container.style.top = marginTop;
    let msgList = dinglj.byClass('pop-msg');
    if (msgList.length >= 5) {
        msgList.sort((n1, n2) => {
            return n1.time - n2.time;
        });
        for (let i = 0; i < msgList.length - 4; i++) {
            distoryPopMsg(msgList[i]);
        }
    }
    const newElemenet = document.createElement('div');
    newElemenet.classList.add('pop-msg', type)
    newElemenet.time = Date.now();

    const icon = document.createElement('div');
    icon.classList.add('pop-msg-icon', type);
    icon.innerText = type.substring(0, 1).toUpperCase();
    newElemenet.appendChild(icon);
    newElemenet.style.opacity = 0;

    newElemenet.innerHTML += msg;
    container.appendChild(newElemenet);

    const padding = 5;
    newElemenet.style.padding = padding + 'px';
    newElemenet.style.height = newElemenet.offsetHeight - (padding * 2) + 'px';
    newElemenet.style.marginBottom = padding + 'px';
    newElemenet.style.opacity = 1;
    setTimeout(() => {
        distoryPopMsg(newElemenet, container);
    }, timeout);
}

/** 提示消息 */
defunc(window.dinglj, 'info', msg => {
    createPopMsg(msg, 'info');
});

/** 提示消息 */
defunc(window.dinglj, 'info', (msg, timeout) => {
    createPopMsg(msg, 'info', timeout);
});

/** 提示消息 */
defunc(window.dinglj, 'info', (msg, timeout, top) => {
    createPopMsg(msg, 'info', timeout, top);
});

/** 报错消息 */
defunc(window.dinglj, 'err', msg => {
    createPopMsg(msg, 'err');
});

/** 报错消息 */
defunc(window.dinglj, 'err', (msg, timeout) => {
    createPopMsg(msg, 'err', timeout);
});

/** 报错消息 */
defunc(window.dinglj, 'err', (msg, timeout, top) => {
    createPopMsg(msg, 'err', timeout, top);
});

/** 警告消息 */
defunc(window.dinglj, 'warn', msg => {
    createPopMsg(msg, 'warn');
});

/** 警告消息 */
defunc(window.dinglj, 'warn', (msg, timeout) => {
    createPopMsg(msg, 'warn', timeout);
});

/** 警告消息 */
defunc(window.dinglj, 'warn', (msg, timeout, top) => {
    createPopMsg(msg, 'warn', timeout, top);
});