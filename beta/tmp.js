function changeTab_001(to = 'history') {
    let container = getById('dinglj-his-star-mask');
    let left = container.style.left || '0px';
    if (to == 'history' && parseInt(left) < 0) {
        moveTab_001(container, '-200px', '0px', 100, () => {
            getById('dinglj-history-title').classList.add('active-tab');
            getById('dinglj-star-title').classList.remove('active-tab');
        });
    } else if (to == 'star' && parseInt(left) > -200) {
        moveTab_001(container, '0px', '-200px', 100, () => {
            getById('dinglj-history-title').classList.remove('active-tab');
            getById('dinglj-star-title').classList.add('active-tab');
        });
    }
}

function moveTab_001(element, from, to, mills = 200, callback = () => {}) {
    let step = (parseInt(to) - parseInt(from)) / mills;
    let timer = setInterval(() => {
        let left = parseInt(element.style.left || '0px');
        console.log(left);
        if ((step > 0 && left > parseInt(to)) || (step < 0 && left < parseInt(to))) {
            clearInterval(timer);
            element.style.left = to;
            return;
        }
        element.style.left = `${ left + step }px`;
    }, 1);
}

changeTab_001('star');