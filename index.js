let express = require('express');
let app = express();
app.set('port', process.env.PORT || 2019);
app.use(express.static(__dirname + '/public'));
let publicDir = __dirname + '/public/';
app.use(require('body-parser')());

// communication to display client
let io = require('socket.io')();

// this variable will hold all danmaku traffic data
// array of json-like key-value pair objects
let dan = [];

app.get('/', (req, res) => {
    res.sendFile(publicDir + 'client.html');
});

app.get('/display', (req, res) => {
    res.sendFile(publicDir + 'display.html');
});

app.get('broadcast', (req, res) => {

});

app.post('/', (req, res) => {
    console.log(req.body);
    dan[dan.length] = {
        content: req.body.content,
        color: req.body.color
    };
    res.sendFile(publicDir + 'client.html');
});

app.listen(app.get('port'), () => {});