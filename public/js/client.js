// ES4 compatible
var socket = io();

var content = document.getElementById('content');
content.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        send();
    }
}, false);

function send() {
    // aoie = arrayOfInputElems
    var inputBar = document.getElementById('content');
    var content = inputBar.value;
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
    inputBar.value = '';
}

// Dark theme
var dark = false;
document.getElementById('dark').className = 'dark-light';
var toggleDark = function () {
    dark = !dark;
    if (dark) {
        document.getElementById('banner').src = 'img/2019_KEY_HSEFZ_DARK.png';
        document.getElementsByTagName('body')[0].className = 'body-dark';
        document.getElementById('content').className = 'content-dark';
        document.getElementById('dark').innerHTML = '<img id="bricon" src="img/brightness_dark.png"/>';
        document.getElementById('dark').className = 'dark-dark';
    } else {
        document.getElementById('banner').src = 'img/2019_KEY_HSEFZ.png';
        document.getElementsByTagName('body')[0].className = 'body-light';
        document.getElementById('content').className = 'content-light';
        document.getElementById('dark').innerHTML = '<img id="bricon" src="img/brightness_light.png"/>';
        document.getElementById('dark').className = 'dark-light';
    }
};