/* 复制文本到剪贴板 */
function copyText(text = '') {
    let old = document.getElementById('dinglj-tip-container');
    if (old) {
        old.remove();
    }
    let box = document.createElement('div');
    box.innerHTML = `<div id="dinglj-tip-container" style="padding: 10px; border-radius: 5px; box-shadow: 0 0 7px -2px grey; font-size: 12px; text-indent: 10px; position: fixed; right: 20px; word-warp: word-break; text-align: left; background: rgba(255, 255, 255, 0.9); top: 20px; font-weight: bold">
        <div style="display: inline-block; vertical-align: top;margin-right: 10px">
            已复制: 
        </div>
        <span id="dinglj-tip" style="text-indent: 0px; display: inline-block; word-break: break-word; padding-right: 20px">
            ${ text }
        </span>
        <div style="width: 5px; height: calc(100% - 10px); background: #4DAFF9; position: absolute; top: 5px; left: 5px"></div>
    </div>`;
    let element = box.children[0];
    document.body.appendChild(element);
    let range = document.createRange();
    range.selectNodeContents(document.getElementById('dinglj-tip'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("Copy", false, null);
    selection.removeAllRanges();
    setTimeout(() => {
        element.remove();
    }, 3000);
}