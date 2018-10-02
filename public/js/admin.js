const socket = io();
let saltedPassword = '';
let logs = document.getElementById('logs');

const authenticate = () => {
    let password = document.getElementById('passwd').value;
    saltedPassword = sha256(password);
};

const positionHash = {
    T: 'top',
    B: 'bottom',
    S: 'slide'
};

const send = () => {
    socket.emit('up', {
        content: document.getElementById('content').value,
        color: document.getElementById('color').value,
        position: positionHash[document.getElementById('position').value],
        size: document.getElementById('size').value,
        from: 'admin',
        passwd: saltedPassword
    });
}

const sendNotice = () => {
    socket.emit('notice', {
        content: document.getElementById('notice').value,
        level: document.getElementById('level').value,
        passwd: saltedPassword
    });
};

//TODO: implement 'LOCK'
const lock = () => {

};