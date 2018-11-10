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

const os = require('os');

const express = require('express');
const app = express();
const http = require('http').Server(app);
app.set('port', process.env.PORT || 2019);
app.use(express.static(__dirname + '/public'));
const publicDir = __dirname + '/public/';
const io = require('socket.io')(http);

const jsonfile = require('jsonfile');
const chalk = require('chalk');

const logFile = './log.json';

// timestamps logs
const timestamp = () => {
    let time = new Date();
    let minute = time.getMinutes();
    let hour   = time.getHours();
    let second = time.getSeconds();
    return `${hour}:${minute}:${second}`;
    //return hour + ':' + minute + ':' + second;

};
let logToFile = obj => {
    // 'a' flag indicates 'append'
    jsonfile.writeFile(logFile, obj, {flag: 'a'});

};

// contains hashed passwds. prevents unwanted admin access.
const passwords = require('./passwd.json');

app.get('/', (req, res) => {
    res.sendFile(publicDir + 'client.html');
});

app.get('/en', (req, res) => {
    res.sendFile(publicDir + 'client-en.html');
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

//contains a lot of unicode (of hearts)
const loveEmojis = ['❤', '💘', '💕', '💗', '💖', '💙', '💚', '💛', '🧡', '💜', '🖤', '💓'];
const randomLove = () => {
    return loveEmojis[Math.floor(Math.random() * loveEmojis.length)];
};

let profaneProhibited = false;

// catches connection from /display, then catches io from clients.
// this means if display refreshes, clients must refresh to establish a new connection.
io.of('/display').on('connection', socket => {
    let usersOnline = 0;
    console.log(chalk.gray('display connected'));
    io.on('connection', client => {
        usersOnline ++;
        console.log(chalk.gray(`a client connected, current users online: ${usersOnline}`));
        client.on('up', data => {
            if (data.content !== '' && data.content.length <= 64) {
                logToFile({content: data.content, time: timestamp(), from: 'client'});
                if (/^\S*\s*((Love|LOVE|love)[sd]?|爱|愛|❤️💘💕💘💕💘💕💘💕)(?!(\s|-)?[Ll][Ii][Vv][Ee])\s*\S*$/.test(data.content) || /^表白/.test(data.content)) {
                    /*
                        love/loves/loved, but not lovelive
                        matches: I love you, Van loves Billy
                        not a match: lovelive, I watch lovelive every day
                     */
                    //  console.log('love');
                    console.log(chalk.magenta(data.content));
                    data.content = randomLove() + data.content + randomLove();
                    console.log(chalk.bgMagenta('special effect added'));
                } else if (/([Ff][Uu][Cc][Kk]|[Ss][Hh][Ii][Tt]|[Bb][Ii][Tt][Cc][Hh]|[Aa][Ss]{2})|艹|傻(逼|(吊|屌))/.test(data.content)) {
                    // yes, it *is* embarrassing.
                    // a. profanity filter actually *brought* profane content into the code
                    // b. the code is no longer ASCII-clean
                    console.warn(chalk.bgRed.white('New Profane Content Received'));
                    if (profaneProhibited) {
                        console.log(chalk.green('[FILTERED] ') + chalk.red(data.content + '\n'));
                        data.content = '';
                    } else console.log(chalk.red(data.content));
                } else {
                    console.log(data.content);
                }
                socket.emit('bullet', data);
            }
        });
        client.on('disconnect', () => {
            usersOnline --;
            console.log(chalk.gray(`a client disconnected, current users online: ${usersOnline}`));
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
        admin.on('cmd', data => {
            if (data.passwd === passwords.admin) {
                // only approve authed admins
                switch (data.command) {
                    case 'bullet':
                        console.log(chalk.yellow(data.content));
                        logToFile({content: data.content, time: timestamp(), from: 'admin'});
                        socket.emit('bullet', data);
                        break;
                    case 'refresh':
                        console.log(chalk.bgYellow.black('REFRESH COMMAND RECEIVED'));
                        logToFile({command: '**ADMIN REQUEST DISPLAY RELOAD**', time:timestamp()});
                        socket.emit('refresh', data);
                        break;
                    case 'profane':
                        console.log(chalk.bgRed('PROFANE FILTER SWITCH RECEIVED: ' + (data.status ? 'ON' : 'OFF')));
                        logToFile({command: `**ADMIN REQUIRE PROFANE FILTER ${data.status ? 'ON' : 'OFF'}**`});
                        profaneProhibited = data.status;
                        break;
                    case 'image':
                        console.log(chalk.bgGreen.white('BG IMAGE COMMAND RECEIVED, FILENAME: ' + data.filename));
                        logToFile({command: `**ADMIN REQUEST IMAGE DISP: ${data.filename ? data.filename : 'CLEAR'}**`});
                        socket.emit('image', data);
                        break;
                }

            } else console.warn(chalk.bgWhite.black('Failed Admin Access Attempt'));
        });

        let osStatus = () => {
            let mem    = os.freemem();
            let byte   = mem%1024;
            mem = (mem - byte) / 1024;
            let kilo   = mem%1024;
            mem = (mem - kilo) / 1024;
            let mega   = mem%1024;
            mem = (mem - mega) / 1024;
            let giga   = mem%1024;

            admin.emit('os', {
                mem: {
                    giga, mega, kilo
                },
                userCount: usersOnline
            });
        };
        setInterval(osStatus, 5000);
    });
});

http.listen(2019, () => {
    console.log(chalk.bgWhite.black('running on port 2019'));
});
