const socket = io();

let content = document.getElementById('content');
content.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        send();
    }
}, false);

let placeholderText = [];
if(/(\/en|\/client-en\.html)/.test(window.location)) {
    placeholderText = [
        'Hey, wanna say something?',
        'Poems are okay, too!',
        'Shake your glowing sticks!',
        'Plz read ToS thoroughly',
        'Show your love today.',
        'Do you like what you see?',
        'School of **EXCELLENCE**',
        'Mind your battery and cellular!',
        'Brightness is on bottom-left.',
        'If not working, browser\'s fault.',
        'Kindly lend ur phone 2 Nokians.',
        'It\'s anonymous!',
        'Special thx 2 prev techie-dudes!'
    ];
} else {
    placeholderText = [
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
}

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
        from: 'client',
        handled: false
    });
    inputBar.value = '';
    inputBar.placeholder = placeholderText[Math.floor(Math.random() * placeholderText.length)];
}

// Dark theme
let dark = false;
document.getElementById('dark').className = 'dark-light';
let toggleDark = function () {
    dark = !dark;
    // TODO: use document fragment to replace this function
    // Hell, forget about this crap. Document frags are not practical in this project.
    if (dark) {
        document.getElementById('banner').src = 'img/2019_KEY_HSEFZ_DARK.png';
        document.getElementsByTagName('body')[0].className = 'body-dark';
        document.getElementById('content').className = 'content-dark';
        document.getElementById('dark').innerHTML = '<img id="bricon" src="img/brightness_dark.png"/>';
        document.getElementById('random').innerHTML = '<img id="random-dataset" src="img/dice_dark.png"/>';
        document.getElementById('submit').innerHTML = '<img id="send-icon" src="img/send_dark.png"/>';
        document.getElementById('dark').className = 'dark-dark';
    } else {
        document.getElementById('banner').src = 'img/2019_KEY_HSEFZ.png';
        document.getElementsByTagName('body')[0].className = 'body-light';
        document.getElementById('content').className = 'content-light';
        document.getElementById('dark').innerHTML = '<img id="bricon" src="img/brightness_light.png"/>';
        document.getElementById('random').innerHTML = '<img id="random-dataset" src="img/dice_light.png"/>';
        document.getElementById('submit').innerHTML = '<img id="send-icon" src="img/send_light.png"/>';
        document.getElementById('dark').className = 'dark-light';
    }
};

let aoie = document.getElementsByTagName('input');
let posTypes = [], colTypes = [], sizTypes = [];
let posRadios = [], colRadios = [], sizRadios = [];
// get input category quant and id
for (let i = 0; i < aoie.length; i++) {
    if (aoie[i].type === 'radio') {
        if (aoie[i].name === 'position') {
            posRadios[posRadios.length] = aoie[i];
        } else if (aoie[i].name === 'color') {
            colRadios[colRadios.length] = aoie[i];
        } else if (aoie[i].name === 'size') {
            sizRadios[sizRadios.length] = aoie[i];
        }
    }
}

const randomDataset = () => {
    let posRand = Math.floor(Math.random() * posRadios.length),
        colRand = Math.floor(Math.random() * colRadios.length),
        sizRand = Math.floor(Math.random() * sizRadios.length);
    position = posRadios[posRand].id;
    color = colRadios[colRand].id;
    size = sizRadios[sizRand].id;

    posRadios[posRand].checked = true;
    colRadios[colRand].checked = true;
    sizRadios[sizRand].checked = true;
};
