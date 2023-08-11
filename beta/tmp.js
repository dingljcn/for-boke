const css_const = {
    title: {
        background: '#321b33',
        height: '40px'
    },
    image: {
        padding: '20px',
    }
}

const css_001 = `body {
    margin: 0;
    font-size: 14px;
}
#dinglj-all-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}
#dinglj-all-title {
    background: ${ css_const.title.background };
    height: ${ css_const.title.height };
    line-height: ${ css_const.title.height };
    display: flex;
    color: white;
}
#dinglj-under-title {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
}
#dinglj-web-name {
    padding: 0 10px;
}
#dinglj-center-title {
    flex: 1;
    padding: 0 10px;
}
#dinglj-other-options {
    padding: 0 10px;
}
#dinglj-left-guide {
    width: 200px;
    height: 100%;
    overflow: hidden;
    display: flex;
}
#dinglj-line-container {
    width: 80px;
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    text-align: center;
}
#dinglj-line-title {
    height: 20px;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-lines {
    padding: 6px;
    flex: 1;
    overflow-y: scroll;
}
#dinglj-lines::webkit-scrollbar {
    width: 5px;
}
#dinglj-step-container {
    flex: 1;
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
}
#dinglj-step-title {
    height: 20px;
    text-align: center;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-steps {
    padding: 6px;
    flex: 1;
    overflow-y: scroll;
}
#dinglj-image-area {
    flex: 1;
    overflow: hidden;
}
#dinglj-image-box {
    width: calc(100% - ${ css_const.image.padding } * 2);
    height: calc(100% - ${ css_const.image.padding } * 2);
    padding: ${ css_const.image.padding };
}
#dinglj-image {
    border-radius: 5px;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    box-shadow: 0 0 10px 1px grey;
}
#dinglj-right-guide {
    width: 200px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
#dinglj-right-title {
    height: 20px;
    display: flex;
    border-bottom: 1px solid rgb(0,0,0,0.1);
}
#dinglj-history-title {
    padding: 0 5px;
}
#dinglj-star-title {
    padding: 0 5px;
}
#dinglj-his-star-list {
    flex: 1;
    overflow: hidden;
}
#dinglj-history-list {
    width: 200px;
    overflow-y: scroll;
}
#dinglj-history-list {
    width: 200px;
    overflow-y: scroll;
}
.dinglj-item {
    padding: 3px 0;
}
.active {
    background: blue;
    color: white;
    border-radius: 5px;
    font-weight: bolder;
}
`;
newElement('style', {
    parentNode: document.head
}, {
    innerText: css_001
}, []);

function initLayout_001() {
    document.body.innerHTML = `<div id="dinglj-all-container">
        <div id="dinglj-all-title">
            <div id="dinglj-web-name">用例截图查看工具</div>
            <div id="dinglj-center-title"></div>
            <div id="dinglj-other-options">其他操作</div>
        </div>
        <div id="dinglj-under-title">
            <div id="dinglj-left-guide">
                <div id="dinglj-line-container">
                    <div id="dinglj-line-title">行数</div>
                    <div id="dinglj-lines">
                        <div class="line-item dinglj-item active" id="line-item-1">1</div>
                        <div class="line-item dinglj-item" id="line-item-2">2</div>
                        <div class="line-item dinglj-item" id="line-item-3">3</div>
                        <div class="line-item dinglj-item" id="line-item-4">4</div>
                        <div class="line-item dinglj-item" id="line-item-5">5</div>
                    </div>
                </div>
                <div id="dinglj-step-container">
                    <div id="dinglj-step-title">步数</div>
                    <div id="dinglj-steps">
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-1">1_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-2">2_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-3">3_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-4">4_查看.png</div>
                    <div class="step-item dinglj-item" id="step-item-5">5_查看.png</div>
                    </div>
                </div>
            </div>
            <div id="dinglj-image-area">
                <div id="dinglj-image-box">
                    <img id="dinglj-image" src="1/11/4_录入.png"/>
                </div>
            </div>
            <div id="dinglj-right-guide">
                <div id="dinglj-right-title">
                    <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                    <div id="dinglj-history-title">历史记录</div>
                    <div id="dinglj-history-star">重点关注</div>
                    <div style="flex: 1; opacity: 0">弹性布局填充物</div>
                </div>
                <div id="dinglj-his-star-list">
                    <div id="dinglj-history-list">
                        <div class="history-item dinglj-item" id="history-item-1">1_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-2">2_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-3">3_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-4">4_查看.png</div>
                        <div class="history-item dinglj-item" id="history-item-5">5_查看.png</div>
                    </div>
                    <div id="dinglj-star-list">
                        <div class="star-item dinglj-item" id="star-item-1">1_查看.png</div>
                        <div class="star-item dinglj-item" id="star-item-2">2_查看.png</div>
                        <div class="star-item dinglj-item" id="star-item-3">3_查看.png</div>
                        <div class="star-item dinglj-item" id="star-item-4">4_查看.png</div>
                        <div class="star-item dinglj-item" id="star-item-5">5_查看.png</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

initLayout_001();