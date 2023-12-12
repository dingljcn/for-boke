if (window.dingljenv == 'dev') {
    window.dinglj_home = 'C:/Users/dinglj/OneDrive/dingljcn/';
} else {
    window.dinglj_home = 'http://8.137.15.188:2245/bk-script/';
}

const urlTypes = {
    k8s: 0,
}

if (!window.readConfig) {
    window.readConfig = function() {
        return {};
    }
}

const baseURL = '';

window.defaultConfig = function() {
    return {
        panels: ['line', 'step', 'history'],
        urls: {

        },
        urlTypes: urlTypes,
        hotKey: {
            back: 'B',
            addStar: 'S',
            cleanStar: 'A',
            cleanHistory: 'Z',
            downloadCase: 'C',
            defaultStep: 'D',
            erpLog: 'E',
            logs: 'X',
            line: '1',
            step: '2',
        }
    }
}

window.getUrlType = function() {
    const url = window.location.href;
    if (url.includesIngoreCase('k8stest.erp.bokesoft.com/') || url.includesIngoreCase('file:///')) {
        return urlTypes.k8s;
    }
}