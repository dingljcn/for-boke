function a () {
    let screenHeight = document.body.offsetHeight - getById('dinglj-all-title').offsetHeight - getById('dinglj-line-title').offsetHeight;
    let scrollHeight = getById('dinglj-lines').scrollHeight;
    let item = getByClass('last line-item')[0];
    let list = getByClass('line-item');
    let i = -1;
    for (i = 0; i < list.length; i++) {
        if (list[i].id == item.id) {
            break;
        }
    }
    let perHeight = item.offsetHeight + ((parseInt(item.style.marginTop || '0') + parseInt(item.style.marginBottom || '0')) / 2);
    
    log(`idx: ${ i }, per: ${ perHeight }, scroll: ${ i * perHeight }`);
    log(`middle: ${ screenHeight / 2 }`);
    logln(`screen: ${ screenHeight }, scroll: ${ scrollHeight }`, item);
}
a();