const socket = io();

let saltedPassword = '';

const authenticate = () => {
    let password = document.getElementById('passwd').value;
    saltedPassword = sha256(password);
}


let position = 'slide',
    color    = 'white',
    size     = 'medium';

const send = () => {
    // aoie = arrayOfInputElems
    let content = document.getElementById('content').value;
    let aoie = document.getElementsByTagName('input');
    for (let i = 0; i < aoie.length; i++) {
        if (aoie[i].type === 'radio' && aoie[i].checked) {
            if (aoie[i].name === 'position') {
                position = aoie[i].id;
            } else if (aoie[i].name === 'color') {
                color = aoie[i].id;
            } else if (aoie[i].name === 'size') {
                size = aoie[i].id;
            }
        }
    }

    socket.emit('up', {
        content,
        color,
        position,
        size,
        from: 'admin',
        passwd: saltedPassword
    });
}
