const socket = io();

let content = document.getElementById('content');
content.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        send();
    }
}, false);

const placeholderText = [
    '说点什么吧',
    '实在没什么说，念诗也可以啊',
    '来为台上的人打 call',
    '仔细读服务条款哦',
    '想表白？可以',
    'Do you like what you see?',
    '台上的人优不优秀？',
    '注意电量和流量！',
    '左下角的按钮可以切换亮暗',
    '如果不能运行，可能是浏览器不支持',
    '如果旁边某位只有诺基亚的同学想借手机，就大方点吧',
    '本弹幕系统完全匿名！',
    '华二首家（划掉）第三家线上弹幕上线啦'
];

let position = '',
    color ='',
    size = '';

function send() {
    // aoie = arrayOfInputElems
    let inputBar = document.getElementById('content');
    let content = inputBar.value;
    if (!position || !color || !size) {
        let aoie = document.getElementsByTagName('input');
        for (let i = 0; i < aoie.length; i++) {
            if (aoie[i].type === 'radio' && aoie[i].checked) {
                if (aoie[i].name === 'position') {
                    position = aoie[i].id;
                } else if (aoie[i].name === 'color') {
                    color = aoie[i].id;
                } else if (aoie[i].name === 'size') {
                    size = aoie[i].id;
                }
            }
        }
    }
    socket.emit('up', {
        content,
        color,
        position,
        size,
        from: 'client'
    });
    inputBar.value = '';
    inputBar.placeholder = placeholderText[Math.floor(Math.random() * placeholderText.length)];
}

// Dark theme
let dark = false;
document.getElementById('dark').className = 'dark-light';
let toggleDark = function () {
    dark = !dark;
    if (dark) {
        document.getElementById('banner').src = 'img/2019_KEY_HSEFZ_DARK.png';
        document.getElementsByTagName('body')[0].className = 'body-dark';
        document.getElementById('content').className = 'content-dark';
        document.getElementById('dark').innerHTML = '<img id="bricon" src="img/brightness_dark.png"/>';
        document.getElementById('random').innerHTML = '<img id="randomDataset" src="img/dice_dark.png"/>';
        document.getElementById('submit').innerHTML = '<img id="send" src="img/send_dark.png"/>';
        document.getElementById('dark').className = 'dark-dark';
    } else {
        document.getElementById('banner').src = 'img/2019_KEY_HSEFZ.png';
        document.getElementsByTagName('body')[0].className = 'body-light';
        document.getElementById('content').className = 'content-light';
        document.getElementById('dark').innerHTML = '<img id="bricon" src="img/brightness_light.png"/>';
        document.getElementById('random').innerHTML = '<img id="randomDataset" src="img/dice_light.png"/>';
        document.getElementById('submit').innerHTML = '<img id="send" src="img/send_light.png"/>';
        document.getElementById('dark').className = 'dark-light';
    }
};

const randomDataset = () => {
    let aoie = document.getElementsByTagName('input');
    let posTypes = [], colTypes = [], sizTypes = [];
    // get input category quant and id
    for (let i = 0; i < aoie.length; i++) {
        if (aoie[i].type === 'radio') {
            if (aoie[i].name === 'position') {
                posTypes[posTypes.length] = aoie[i].id;
            } else if (aoie[i].name === 'color') {
                colTypes[colTypes.length] = aoie[i].id;
            } else if (aoie[i].name === 'size') {
                sizTypes[sizTypes.length] = aoie[i].id;
            }
        }
    }
    position = posTypes[Math.floor(Math.random() * posTypes.length)];
    color = colTypes[Math.floor(Math.random() * colTypes.length)];
    size = sizTypes[Math.floor(Math.random() * sizTypes.length)];
    console.log(position, color, size);
};