const map = {};

const queue = {};

window.dinglj.msg = {};

defunc(window.dinglj.msg, 'send', (_this, event, data) => {
    dinglj.msg.send(_this, event, '', data);
});

defunc(window.dinglj.msg, 'send', (_this, event, targetId, data) => {
    const key = `${ event }-${ targetId }`;
    if (!map[key]) {
        dinglj.pushToObj(queue, key, {
            that: this,
            data: data,
        });
    } else {
        let results = [];
        for (let func of map[key]) {
            results.push(func(_this, data));
        }
        return results.length == 1 ? results[0] : results;
    }
});

defunc(window.dinglj.msg, 'on', function(event, func) {
    dinglj.msg.on(event, '', func);
});

defunc(window.dinglj.msg, 'on', function(event, myId, func) {
    const key = `${ event }-${ myId }`;
    dinglj.pushToObj(map, key, func);
    if (queue[key]) {
        for (let item of queue[key]) {
            func(item.that, item.data);
        }
    }
});