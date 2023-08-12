function bindKeyboardEvent_001() {
    window.addEventListener('keyup', e => {
        onKeyUp_001(e);
    });
}

function onKeyUp_001(e) {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        changeItem_001(e.key == 'ArrowUp', e);
    } else if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        changeScope_001(e.key == 'ArrowLeft', e);
    }
}

function changeItem_001(isPrev, e) {
    console.log(e.key);
    let element = getByClass('active')[0];
    let prevStep = element.previousElementSibling;
    let nextStep = element.nextElementSibling;
    if (context_001.focus == 'step') {
        if (isPrev) { // 向前翻
            if (prevStep) { // 前一个步骤存在, 直接切换
                prevStep.click();
            } else { // 不存在, 跳转到前一个步骤的最后一个
                let lastLine = getByClass('line-item last')[0];
                if (lastLine.previousElementSibling) {
                    let step = toLine_001('step', 'line', lastLine.previousElementSibling, 'tail');
                    if (step) {
                        toItem_001('line', 'step', step);
                    }
                }
            }
        }
    }
}

function changeScope_001(isLeft, e) {
    
}

bindKeyboardEvent_001();