const socket = io.connect('/display');
const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let bullets = [];

let fire = dan => {
    bullets[bullets.length] = document.createElement('div');
    // go to lunch, push first
    // TODO: fancy UI here
}

socket.on('bullet', data => {
    console.log(data);
    
});