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
// for stylizing console output
const chalk = require('chalk');

// you may have to create one yourself
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

// catches connection from /display, then catches io from clients.
// this means if display refreshes, clients must refresh to establish a new connection.
io.of('/display').on('connection', socket => {
    let usersOnline = 0;
    console.log(chalk.gray('display connected'));
    io.of('/').on('connection', client => {
        usersOnline ++;
        console.log(chalk.gray(`a client connected, current users online: ${usersOnline}`));
        client.on('up', data => {
            // client upload length restriction
            if (data.content !== '' && data.content.length <= 64 && data.handled === false) {
                    let approved = true,
                        locked = false;
                    for (let j = 0; j < whitelist.length; j++) {
                        if (whitelist[j].activate && data.content.toLowerCase().includes(whitelist[j].content)) {
                            locked = true;
                            console.log(chalk.green(`[APPROVED BY WHITELIST] ${data.content}`));
                            break;
                            // will auto approve bullets whose content is included by whitelist
                            // **unless** blacklist listed it 'force' filter
                        }
                    }
                    for (let i = 0; i < filterList.length; i++) {
                        if (data.content.toLowerCase().includes(filterList[i].content) && filterList[i].filter && (filterList[i].force || !locked)) {
                            // init filter status
                            approved = false;
                            locked = false;
                            console.log(chalk.red(`[FILTERED: '${filterList[i].type}'] ${data.content}`));
                            break;
                        }
                    }
                    if (approved && !locked) {
                        console.log(data.content);
                    }
                    if (approved) {
                        logToFile({content: data.content, time: timestamp(), from: 'client', filtered: false});
                        socket.emit('bullet', data);
                    } else {
                        logToFile({content: data.content, time: timestamp(), from: 'client', filtered: true});
                        // bullet thrown away
                    }
                    approved = true;
                    locked = false;
                    setTimeout(() => {data.handled = true}, 1); // messy workaround as of near the end of december
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
                    //  when admin submits commands, they use websocket to send an object
                    // whose format is {command: 'xx', data: ..., ..., passwd: ...}
                    // here we detect their command property.
                    // ref: admin.js

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

                    case 'modifyFilter':
                        let anotherTempList = require('./filter.json');
                        // scheme: modify a temp array first, then apply to filter file

                        switch (data.property) {
                            case 'force':
                                anotherTempList.blacklist[data.id].force = data.value;
                                console.log(chalk.bgRed.white(`FILTER MODIFICATION RECEIVED, ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FORCE TO ${data.value ? 'TRUE' : 'FALSE'}`));
                                logToFile({command: `ADMIN MODIFY BL ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FORCE TO ${data.value ? 'TRUE' : 'FALSE'}`});
                                break;

                            case 'activate':
                                anotherTempList.blacklist[data.id].filter = data.value;
                                console.log(chalk.bgRed.white(`FILTER MODIFICATION RECEIVED, ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FILTER TO ${data.value ? 'TRUE' : 'FALSE'}`))
                                logToFile({command: `ADMIN MODIFY BL ID #${data.id} (CONTENT: ${filterList[data.id].content}) PROPERTY FILTER TO ${data.value ? 'TRUE' : 'FALSE'}`});
                                break;
                        }
                        jsonfile.writeFile('./filter.json', anotherTempList);

                    case 'newWhitelist':
                        console.log(chalk.bgGreen.white(`NEW WHITELIST RECEIVED, CONTENT: ${data.content}`));
                        logToFile({command: `ADMIN APPLY NEW WHITELIST, CONTENT: ${data.content}`});
                        let tempListForWl = require('./filter.json');
                        let tempDataForWl = {content: data.content, activate: true};
                        tempListForWl.whitelist[tempListForWl.whitelist.length] = tempDataForWl;
                        jsonfile.writeFile('./filter.json', tempListForWl);
                        break;

                    case 'modifyWhitelist':
                        let tempWhitelist = require('./filter.json');

                        switch (data.property) {
                            case 'activate':
                                tempWhitelist.whitelist[data.id].activate = data.value;
                                console.log(chalk.bgGreen.white(`WHITELIST MODIFICATION RECEIVED, ID #${data.id} (CONTENT: ${whitelist[data.id].content}) PROPERTY ACTIVATE TO ${data.value ? 'TRUE' : 'FALSE'}`));
                                logToFile({command: `ADMIN MODIFY WL ID #${data.id} (CONTENT: ${whitelist[data.id].content}) PROPERTY ACTIVATE TO ${data.value ? 'TRUE' : 'FALSE'}`});
                                break;
                        }
                        jsonfile.writeFile('./filter.json', tempWhitelist);
                }

            } else console.warn(chalk.bgWhite.black('Failed Admin Access Attempt'));
        });

        // admin will receive and display
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
            admin.emit('whitelist', whitelist);
        };
        setInterval(sendFilter, 5000);
    });
});

http.listen(2019, () => {
    console.log(chalk.bgWhite.black('running on port 2019'));
    // good luck.
});
