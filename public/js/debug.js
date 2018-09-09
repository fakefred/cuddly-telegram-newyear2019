var socket = io();

const colors = ['white', 'red', 'green', 'yellow', 'blue'];
const sizes  = ['small', 'medium', 'large'];

let singleTest = () => {
    socket.emit('up', {
        content: 'Hello World!',
        color: colors[Math.floor(Math.random() * colors.length)],
        position: 'slide',
        size: sizes[Math.floor(Math.random() * sizes.length)],
        from: 'debug'
    });
}

let simulTest = num => {
    for (c = num; c > 0; c--){
        singleTest();
    }
}

let lapseTest = (num, intv) => {
    let c = num;
    let send = () => {
        singleTest();
        c--;
        if (c > 0){
            setTimeout(send, intv);
        }
    }
    send();
}