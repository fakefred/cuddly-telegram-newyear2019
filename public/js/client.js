var socket = io();

function send() {
    // aoce = arrayOfColorElems
    var content = document.getElementById('content').value;
    var aoce = document.getElementsByTagName('input');
    for (i = 0; i < aoce.length; i++) {
        if (aoce[i].type === 'radio' && 
            aoce[i].name === 'color' && 
            aoce[i].checked            ) {
                var color = aoce[i].id;
        }
    }
    
    socket.emit('up', {
        content: content,
        color: color
    });
    //id++;
}