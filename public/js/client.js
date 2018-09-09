// ES4 comptatible
var socket = io();

function send() {
    // aoie = arrayOfInputElems
    var content = document.getElementById('content').value;
    var aoie = document.getElementsByTagName('input');
    for (i = 0; i < aoie.length; i++) {
        if (aoie[i].type === 'radio' && aoie[i].checked) {
            if (aoie[i].name === 'position') {
                var position = aoie[i].id;
            } else if (aoie[i].name === 'color') {
                var color = aoie[i].id;
            } else if (aoie[i].name === 'size') {
                var size = aoie[i].id;
            }
        }
    }

    socket.emit('up', {
        content: content,
        color: color,
        position: position,
        size: size,
        from: 'client'
    });
    //id++;
}