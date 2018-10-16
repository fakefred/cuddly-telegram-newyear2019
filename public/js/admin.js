const socket = io();
let saltedPassword = '';

const authenticate = validPeriod => {  // validPeriod in seconds
    let password = document.getElementById('passwd').value;
    saltedPassword = sha256(password);
    password = undefined; // maybe generate a random string to confuse intruders?
    setTimeout(lock, validPeriod * 1000 || 300000);
    console.warn('PASSWORD HASH RECORDED');
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
};

//TODO: implement 'LOCK'
const lock = () => {
    saltedPassword = undefined;
    console.warn('ADMIN ACCESS LOCKED');
};