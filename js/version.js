import { computeIfAbsent } from './global.js';

let map = new Map();
computeIfAbsent(map, 'id', '#12345');
console.log(map);

document.getElementById('click-me').addEventListener('click', e => {
    console.log('clicked');
    clickedBtn();
});

function clickedBtn() {
    console.log(map);
    alert(111);
}