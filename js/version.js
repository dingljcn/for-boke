import { computeIfAbsent } from './global.js';

let map = new Map();
computeIfAbsent(map, 'id', '#12345');
console.log(map);

function clickedBtn() {
    console.log(map);
    alert(111);
}

export function clickBtn2() {
    alert(222);
}