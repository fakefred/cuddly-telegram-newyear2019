const socket = io.connect('/display');
socket.on('bullet', data => {
    console.log(data);
});