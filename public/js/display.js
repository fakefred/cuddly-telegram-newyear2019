const socket = io.connect('/display');
const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

socket.on('bullet', data => {
    console.log(data);
    
});