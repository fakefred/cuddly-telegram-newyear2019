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

// node.js internal api
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
let filterList = require('./filter.json').blacklist,
    whitelist  = require('./filter.json').whitelist;
setInterval(() => {
    filterList = require('./filter.json').blacklist;
    whitelist  = require('./filter.json').whitelist;
}, 5000);

// timestamps logs
const timestamp = () => {
    let time = new Date();
    let minute = time.getMinutes();
    let hour   = time.getHours();
    let second = time.getSeconds();
    return `${hour}:${minute}:${second}`;
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
    io.of('/').on('connection', client => {
        usersOnline ++;
        console.log(chalk.gray(`a client connected, current users online: ${usersOnline}`));
        client.on('up', data => {
            if (data.content !== '' && data.content.length <= 64) {
                let approved = true,
                    locked = false;
                for (let j = 0; j < whitelist.length; j ++) {
                    if (whitelist[j].activate && data.content.toLowerCase().includes(whitelist[j].content)) {
                        locked = true;
                        console.log(chalk.green(`[APPROVED BY WHITELIST] ${data.content}`));
                        break;
                    }
                }
                for (let i = 0; i < filterList.length; i ++) {
                    if (data.content.toLowerCase().includes(filterList[i].content) && filterList[i].filter && (filterList[i].force || !locked)) {
                        approved = false;
                        locked = false;
                        console.log(chalk.red(`[FILTERED: '${filterList[i].type}'] ${data.content}`));
                        break;
                    }
                }
                if (approved && !locked) {
                    console.log(data.content);
                }
                if (/^\S\S*\s*(loves?|爱|愛|喜欢|likes?|❤️💘💕💘💕💘💕💘💕)(?!(\s|-)?live)\s*\S*\S$/ui.test(data.content) || /^表白/u.test(data.content)) {
                    /*
                        love/loves/loved, but not lovelive
                        matches: I love you, Van loves Billy
                        not a match: lovelive, I watch lovelive every day
                     */
                    console.log(chalk.magenta(data.content));
                    data.content = randomLove() + data.content + randomLove();
                    console.log(chalk.bgMagenta('special effect added'));
                }
                if (approved) {
                    logToFile({content: data.content, time: timestamp(), from: 'client', filtered: false});
                    socket.emit('bullet', data);
                } else {
                    logToFile({content: data.content, time: timestamp(), from: 'client', filtered: true});
                }
                approved = true;
                locked = false;
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
                        if (data.level === 'warn') {
                            // inside the string: exclamation-in-triangle emojis with data.content in between
                            data.content = `⚠️${data.content}⚠️`;
                        } else if (data.level === 'info') {
                            // inside the string: bell emoji, data.content, bell emoji
                            data.content = `🔔${data.content}🔔`;
                        }
                        socket.emit('bullet', data);
                        break;
                    case 'refresh':
                        console.log(chalk.bgYellow.black('REFRESH COMMAND RECEIVED'));
                        logToFile({command: '**ADMIN REQUEST DISPLAY RELOAD**', time:timestamp()});
                        socket.emit('refresh', data);
                        break;
                    case 'image':
                        console.log(chalk.bgGreen.white('BG IMAGE COMMAND RECEIVED, FILENAME: ' + data.filename));
                        logToFile({command: `**ADMIN REQUEST IMAGE DISP: ${data.filename ? data.filename : 'CLEAR'}**`});
                        socket.emit('image', data);
                        break;
                    case 'newFilter':
                        console.log(chalk.bgRed.white(`NEW FILTER RECEIVED, CONTENT: ${data.content}, TYPE: ${data.type}, FORCE: ${data.force}`));
                        logToFile({command: `ADMIN APPLY NEW FILTER, CONTENT: ${data.content}, TYPE: ${data.type}, FORCE: ${data.force}`});
                        let tempList = require('./filter.json');
                        let tempData = {content: data.content, type: data.type, filter: true, force: data.force};
                        tempList.blacklist[tempList.blacklist.length] = tempData;
                        jsonfile.writeFile('./filter.json', tempList);
                        break;
                        // BUG ZONE
                    case 'modifyFilter':
                        let anotherTempList = require('./filter.json');
                        switch (data.property) {
                            case 'force':
                                anotherTempList.blacklist[data.id].force = data.value;
                                console.log(chalk.bgRed.white(`FILTER MODIFICATION RECEIVED, ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FORCE TO ${data.value ? 'TRUE' : 'FALSE'}`));
                                logToFile({command: `ADMIN MODIFY ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FORCE TO ${data.value ? 'TRUE' : 'FALSE'}`});
                                break;
                            case 'activate':
                                anotherTempList.blacklist[data.id].filter = data.value;
                                console.log(chalk.bgRed.white(`FILTER MODIFICATION RECEIVED, ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FILTER TO ${data.value ? 'TRUE' : 'FALSE'}`))
                                logToFile({command: `ADMIN MODIFY ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FILTER TO ${data.value ? 'TRUE' : 'FALSE'}`});
                                break;
                        }
                        jsonfile.writeFile('./filter.json', anotherTempList);
                        // END BUG ZONE

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

        let sendFilter = () => {
            admin.emit('filterList', filterList);
        };
        setInterval(sendFilter, 5000);
    });
});

http.listen(2019, () => {
    console.log(chalk.bgWhite.black('running on port 2019'));
});
