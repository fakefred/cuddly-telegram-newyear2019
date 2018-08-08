/*
    MIT License

    Copyright (c) 2018 Frederick as for now

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

    ALSO, HAPPY NEW YEAR 2019.
*/

let express = require('express');
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 2019);
app.use(express.static(__dirname + '/public'));
let publicDir = __dirname + '/public/';
// this dep parses incoming POST req from client to JSON-like data format
app.use(require('body-parser')());

// this variable will hold all danmaku traffic data
// array of json-like key-value pair objects
let dan = [];
let nextUnreadDanIndex = 0;

app.get('/', (req, res) => {
    res.sendFile(publicDir + 'client.html');
});

app.get('/display', (req, res) => {
    // projector
    res.sendFile(publicDir + 'display.html');
});

app.post('/', (req, res) => {
    if (req.body.content !== '') {
        console.log(req.body);
        dan[dan.length] = {
            content: req.body.content,
            color: req.body.color
        };
    }
    
    res.sendFile(publicDir + 'client.html');
});

io.of('/display').on('connection', socket => {
    console.log('client connected');
    let sendBullet = () => {
        let nextDan = dan[nextUnreadDanIndex];
        if (nextDan !== undefined && nextDan.content !== '') {
            socket.emit('bullet', {
                content: nextDan.content,
                color: nextDan.color
            });
            nextUnreadDanIndex ++;
        }
    };
    setInterval(sendBullet, 2);
});

http.listen(2019, () => {
    console.log('running on port 2019');
});