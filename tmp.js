context_003.onPostShow = [];
function createSelectElement(list = [], config = {
    id: `select-${ uuid() }`,
    width: '120px',
    maxHeight: '50px',
    height: '20px'
}) {
    context_003.onPostShow.push(() => {
        let select = getById(config.id);
        let selections = [];
        selections.push(...(select.children[0].children));
        let value = selections.splice(0, 1);
        mouseIOEvent([ select ], (element, event) => {
            element.children[0].style.height = config.maxHeight;
            element.children[0].style.overflowY = 'scroll';
        }, (element, event) => {
            element.children[0].style.height = config.height;
            element.children[0].style.overflowX = 'hidden';
        });
        listActiveChange(selections, {}, {}, (element, event) => {
            let select = getById(config.id);
            let selections = [];
            selections.push(...(select.children[0].children));
            let value = selections.splice(0, 1);
            value.title = element.title;
            value.innerText = element.innerText;
        })
    });
    console.log(config);
    return `<div class="dinglj-select" id="${ config.id }" style="width: ${ config.width }; height: ${ config.height }">
        <div class="dinglj-select-selections" style="width: ${ config.width }; height: ${ config.height }">
            <div class="dinglj-select-value" style="width: ${ config.width }; height: ${ config.height }" title="${ list[0].value }">${ list[0].caption }</div>
            ${ list.map(i => {
                return `<div class="dinglj-select-selection" style="width: ${ config.width }; height: ${ config.height }" title="${ i.value }">${ i.caption }</div>`
            }).join('') }
        </div>
    </div>`;
}
let list = [
    { caption: '8月', value: 8 },
    { caption: '7月', value: 7 },
    { caption: '6月', value: 6 },
    { caption: '5月', value: 5 },
];
document.body.innerHTML = createSelectElement(list);

for (let callback of context_003.onPostShow) {
    callback();
}