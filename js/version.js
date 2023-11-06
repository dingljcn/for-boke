import { TimeUnit } from './entities/TimeUnit.js';
import { computeIfAbsent, getLocalStorage, setLocalStorage } from './global.js';

let map = new Map();
computeIfAbsent(map, 'id', '#12345');

document.getElementById('click-me').addEventListener('click', e => {
    console.log('clicked');
    let testData = getLocalStorage('dinglj-test');
    testData.id = '1231231';
    if (testData.arr) {
        testData.arr.push(testData.arr.length + 1);
    } else {
        testData.arr = [ 1 ];
    }
    console.log(testData);
    setLocalStorage('dinglj-test', testData, TimeUnit.Second(10));
    clickedBtn();
});

function clickedBtn() {
    console.log(map);
    alert(111);
}