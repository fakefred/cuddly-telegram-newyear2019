const socket = io.connect('/display');
const canvas = document.getElementById('canvas');

let windowWidth= window.innerWidth;
let windowHeight = window.innerHeight;
canvas.width = windowWidth;
canvas.height = windowHeight;

let ctx = canvas.getContext('2d');
ctx.font = '30px Noto Sans';
ctx.fillStyle = '#ffffff';

let bullets = [];

socket.on('bullet', data => {
    console.log(data);
    bullets[bullets.length] = {
        content: data.content,
        color: data.color,
        position: data.position,
        y: Math.floor(Math.random() * windowHeight),
        speed: Math.random() * 3 + 1,
        size: data.size,
        frame: 0
    }
});

let refreshFrame = () => {
    ctx.clearRect(0, 0 ,windowWidth, windowHeight);
    for (i = 0; i < bullets.length; i++) {
        // development emergency stop
        // start from here
    }
}