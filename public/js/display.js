const socket = io.connect('/display');
const canvas = document.getElementById('canvas');

let windowWidth= window.innerWidth;
let windowHeight = window.innerHeight;
canvas.width = windowWidth;
canvas.height = windowHeight;

let ctx = canvas.getContext('2d');
// default: medium, white
ctx.font = '30px Noto Sans';
ctx.fillStyle = '#ffffff';
// similar configurations
ctx.shadowColor = '#666666';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 2;
ctx.shadowOffsetY = 2;

let bullets = [];
let startFrom = 0;

socket.on('bullet', data => {
    console.log(data);
    if (data.from === 'debug'){
        console.log(bullets.length);
    }
    bullets[bullets.length] = {
        content: data.content,
        color: data.color,
        position: data.position,
        y: Math.floor(Math.random() * windowHeight),
        speed: Math.random() * 3 + 2,
        size: data.size,
        frame: 0
    }
});

const sizeHash = {
    small:  '20px Noto Sans',
    medium: '30px Noto Sans',
    large:  '40px Noto Sans'
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
            ctx.fillText(dan.content, windowWidth - dan.speed * dan.frame, dan.y);
            dan.frame ++;
            if (windowWidth - dan.speed * dan.frame >= windowWidth * 3 / 2) {
                bullets[i] = undefined;
                startFrom = i + 1;
            }
        }
    }
}

setInterval(refreshFrame, 25);