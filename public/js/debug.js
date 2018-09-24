let socket = io();

let saltedPassword = '';
const authenticate = () => {
    let password = document.getElementById('passwd').value;
    saltedPassword = sha256(password);
}

const colors    = ['white', 'red', 'green', 'yellow', 'blue'];
const sizes     = ['small', 'medium', 'large'];
const positions = ['slide', 'top', 'bottom'];

let singleTest = () => {
    let content = document.getElementById('content').value;
    socket.emit('up', {
        content,
        color: colors[Math.floor(Math.random() * colors.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        from: 'debug',
        passwd: saltedPassword
    });
}

let simulTest = num => {
    let content = document.getElementById('content').value;
    for (c = num; c > 0; c--){
        singleTest();
    }
}

let lapseTest = (num, intv) => {
    let content = document.getElementById('content').value;
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

let testAsDefined = () => {
    let quant = document.getElementById('quant').value;
    let interval = document.getElementById('interval').value;
    if (interval === '0' || interval === '') {
        simulTest(quant);
    } else {
        lapseTest(quant, interval);
    }
}