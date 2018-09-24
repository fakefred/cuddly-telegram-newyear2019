const socket = io.connect('/display');
const canvas = document.getElementById('canvas');

let windowWidth= window.innerWidth;
let windowHeight = window.innerHeight;
canvas.width = windowWidth - 8;
canvas.height = windowHeight;

let ctx = canvas.getContext('2d');
// default: medium, white
ctx.font = '30px Noto Sans';
ctx.fillStyle = '#ffffff';
// similar configurations can be found at
// https://github.com/hsefz2018/cuddly-telegram-newyear2016/blob/master/comments.js
ctx.shadowColor = '#666666';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 2;
ctx.shadowOffsetY = 2;

let bullets = [];
let startFrom = 0;

socket.on('bullet', data => {
    console.log(data);
    if (data.from === 'debug') console.log(bullets.length);
    bullets[bullets.length] = {
        content: data.content,
        width: ctx.measureText(data.content).width,
        color: data.color,
        position: data.position,
        size: data.size,
        frame: 0
    };
    if (data.position === 'slide') {
        bullets[bullets.length - 1].y = Math.floor(Math.random() * (windowHeight - 40));
        bullets[bullets.length - 1].speed = Math.floor(Math.random() * 3) + 2;
    } else if (data.position === 'top') {
        bullets[bullets.length - 1].y = Math.random() * (windowHeight / 2 - 40);
        bullets[bullets.length - 1].framesToShow = Math.floor(Math.random() * 80) + 120;
    } else if (data.position === 'bottom') {
        bullets[bullets.length - 1].y = Math.random() * (windowHeight / 2 - 40) + windowHeight / 2;
        bullets[bullets.length - 1].framesToShow = Math.floor(Math.random() * 80) + 120;
    }
});

const sizeHash = {
    small:  '20px Noto Sans',
    medium: '30px Noto Sans',
    large:  '40px Noto Sans',
    xlarge: '50px Noto Sans'
};

// some colors are not yet implemented
const colorHash = {
    white : '#fff',
    blue  : '#22f',
    red   : '#f22',
    green : '#2f2',
    yellow: '#ff2',
    pink  : '#f2f',
    cyan  : '#2ff',
    gray  : '#aaa'
}

let refreshFrame = () => {
    ctx.clearRect(0, 0, windowWidth, windowHeight);
    for (i = startFrom; i < bullets.length; i++) {
        let dan = bullets[i];
        if (dan) {
            ctx.font = sizeHash[dan.size];
            ctx.fillStyle = colorHash[dan.color];
            if (dan.position === 'slide') {
                ctx.fillText(dan.content, windowWidth - dan.speed * dan.frame, dan.y);
                dan.frame ++;
                if (dan.speed * dan.frame > windowWidth + dan.width) {
                    bullets[i] = undefined;
                    startFrom ++;
                }
            } else if (dan.position === 'top' || dan.position === 'bottom') {
                ctx.fillText(dan.content, (windowWidth - dan.width) / 2, dan.y);
                dan.framesToShow--;
                if (dan.framesToShow === 0) bullets[i] = undefined;
            }
        }
    }
}

setInterval(refreshFrame, 25);