const socket = io('/admin');
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
    socket.emit('cmd', {
        command: 'bullet',
        content: document.getElementById('content').value,
        color: document.getElementById('color').value,
        position: positionHash[document.getElementById('position').value],
        size: document.getElementById('size').value,
        from: 'admin',
        passwd: saltedPassword
    });
};

const lock = () => {
    saltedPassword = undefined;
    console.warn('ADMIN ACCESS RESTRICTED');
};

const refresh = () => {
    socket.emit('cmd', {
        command: 'refresh',
        passwd: saltedPassword
    });
};

let profanityProhibited = false;
const profane = () => {
    profanityProhibited = !profanityProhibited;
    socket.emit('cmd', {
        command: 'profane',
        status: profanityProhibited,
        passwd: saltedPassword
    });
};

const clearImg = () => {
    socket.emit('cmd', {
        command: 'image',
        filename: '',
        passwd: saltedPassword
    });
};

const displayImg = () => {
    let filename = document.querySelector('#filename').value;
    socket.emit('cmd', {
        command: 'image',
        filename,
        passwd: saltedPassword
    });
};

socket.on('os', os => {
    document.querySelector('#status').innerHTML = `FREEMEM: ${os.mem.giga}G ${os.mem.mega}M ${os.mem.kilo}K   USERS ONLINE: ${os.userCount}`;
});