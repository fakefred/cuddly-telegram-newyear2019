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
// I don't know why, socket.io tutorial says that
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.set('port', process.env.PORT || 2019);
app.use(express.static(__dirname + '/public'));
let publicDir = __dirname + '/public/';
// this dep parses incoming POST req from client to JSON-like data format
app.use(require('body-parser')());

app.get('/', (req, res) => {
    res.sendFile(publicDir + 'client.html');
});

app.get('/display', (req, res) => {
    // projector
    res.sendFile(publicDir + 'display.html');
});

app.get('/debug', (req, res) => {
    res.sendFile(publicDir + 'debug.html');
});

// catches connection from /display, then catches io from clients.
// this means if display refreshes, clients must refresh to establish a new connection.
io.of('/display').on('connection', socket => {
    console.log('display connected');
    io.on('connection', client => {
        console.log('a client connected');
        client.on('up', data => {
            if (data.content !== '') {
                console.log(data);
                socket.emit('bullet', data);
            }
        });
    });
    io.of('/debug', debug => {
        console.log('debugging');
        client.on('up', data => {
            console.log(data);
            socket.emit('bullet', data);
        });
    })
});

http.listen(2019, () => {
    console.log('running on port 2019');
});