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
let http = require('http').Server(app);
let io = require('socket.io')(http);

const passwords = require('./passwd.json');
// contains hashed passwds. prevents unwanted admins.

app.set('port', process.env.PORT || 2019);
app.use(express.static(__dirname + '/public'));
let publicDir = __dirname + '/public/';

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

app.get('/admin', (req, res) => {
    res.sendFile(publicDir + 'admin.html');
});

// catches connection from /display, then catches io from clients.
// this means if display refreshes, clients must refresh to establish a new connection.
io.of('/display').on('connection', socket => {
    let usersOnline = 0;
    console.log('display connected');
    io.on('connection', client => {
        usersOnline ++;
        console.log('a client connected, current users online: ' + usersOnline);
        client.on('up', data => {
            if (data.content !== '') {
                console.log(data);
                socket.emit('bullet', data);
            }
        });
        client.on('disconnect', () => {
            usersOnline --;
            console.log('a client disconnected, current users online: ' + usersOnline);
        });
    });

    io.of('/debug').on('connection', debug => {
        debug.on('up', data => {
            if (data.passwd === passwords.debug) {
                console.debug(data);
                socket.emit('bullet', data);
            }
        });
    });

    io.of('/admin').on('connection', admin => {
        admin.on('up', data => {
            if (data.passwd === passwords.admin) {
                // only approve authed admins
                console.debug(data);
                socket.emit('bullet', data);
            }
        });
    });
});

http.listen(2019, () => {
    console.log('running on port 2019');
});