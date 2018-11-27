const socket = io('/admin');
let saltedPassword = '';

const authenticate = validPeriod => {  // validPeriod in seconds
    let password = document.getElementById('passwd').value;
    saltedPassword = sha256(password);
    password = undefined; // maybe generate a random string to confuse intruders?
    setTimeout(lock, validPeriod * 1000 || 300000);
    console.warn('PASSWORD HASH RECORDED:' + saltedPassword);
};

const positionHash = {
    T: 'top',
    B: 'bottom',
    S: 'slide'
};

const levelHash = {
    W: 'warn',
    I: 'info',
    X: 'none'
};

const predefinedText = {
    reqClientReload: '请大家现在刷新网页',
    dispURL: '我们在 https://domain.tld/',  // autometalogolex.me, as for present
    noFlooding: '请不要刷屏，谢谢',
    happyNewYear: '2019@HSEFZ 新年快乐！',
    adminQuote: '管理员曰：',
    clear: ''
};

const contentArea = document.querySelector('#content'),
      colorBar    = document.querySelector('#color'),
      positionBar = document.querySelector('#position'),
      sizeBar     = document.querySelector('#size'),
      levelBar    = document.querySelector('#level');

const fillBulletText = textIndex => {
    contentArea.value = predefinedText[textIndex];
};

const send = () => {
    socket.emit('cmd', {
        command: 'bullet',
        content: contentArea.value,
        color: colorBar.value,
        position: positionHash[positionBar.value],
        size: sizeBar.value,
        level: levelHash[levelBar.value],
        from: 'admin',
        passwd: saltedPassword
    });
};

const lock = () => {
    saltedPassword = undefined;
    console.warn('ADMIN ACCESS RESTRICTED');
};

const refresh = () => {
    socket.emit('cmd', {
        command: 'refresh',
        passwd: saltedPassword
    });
};

const clearImg = () => {
    socket.emit('cmd', {
        command: 'image',
        filename: '',
        passwd: saltedPassword
    });
};

const displayImg = () => {
    let filename = document.querySelector('#filename').value;
    socket.emit('cmd', {
        command: 'image',
        filename,
        passwd: saltedPassword
    });
};

socket.on('os', os => {
    document.querySelector('#status').innerHTML = `FREEMEM: ${os.mem.giga}G ${os.mem.mega}M ${os.mem.kilo}K   USERS ONLINE: ${os.userCount}`;
});

let filterForce = false;

const flipFilterForce = () => {
    filterForce = !filterForce;
    document.querySelector('#filter-force').innerHTML = 'FORCE: ' + (filterForce ? 'Y' : 'N');
};

let filterList = [];
let whitelist = [];

const filterToggleForce = id => {
    filterList[id].force = !filterList[id].force;
    socket.emit('cmd', {
        command: 'modifyFilter',
        id,
        property: 'force',
        value: filterList[id].force,
        passwd: saltedPassword
    });
    document.getElementsByClassName('filter-force')[id].innerHTML = filterList[id].force ? 'Y' : 'N';
};

const filterToggleActivate = id => {
    filterList[id].filter = !filterList[id].filter;
    socket.emit('cmd', {
      command: 'modifyFilter',
      id,
      property: 'activate',
      value: filterList[id].filter,
      passwd: saltedPassword
  });
  document.getElementsByClassName('filter-activate')[id].innerHTML = (filterList[id].filter ? 'DE' : '') + 'ACTIVATE';
};

const whitelistToggleActivate = id  => {
    whitelist[id].activate = !whitelist[id].activate;
    socket.emit('cmd', {
        command: 'modifyWhitelist',
        id,
        property: 'activate',
        value: whitelist[id].activate,
        passwd: saltedPassword
    });
    document.getElementsByClassName('whitelist-activate')[id].innerHTML = whitelist[id].activate ? 'DEACTIVATE' : 'ACTIVATE';
};

let filterListDivContent = '';
socket.on('filterList', list => {
    filterList = list;
    for (let i = 0; i < list.length; i ++) {
        let item = list[i];
        filterListDivContent += `CONTENT: '${item.content}'; TYPE: '${item.type}'; FORCE: <button class="filter-force" onclick="filterToggleForce(${i})">${item.force ? 'Y' : 'N'}</button> <button class="filter-activate" onclick="filterToggleActivate(${i})">${item.filter ? 'DEACTIVATE' : 'ACTIVATE'}</button><br/>`;
    }
    document.querySelector('#filter-list').innerHTML = filterListDivContent;
    filterListDivContent = '';
});

let whitelistDivContent = '';
socket.on('whitelist', list => {
    whitelist = list;
    for (let i = 0; i < list.length; i ++) {
        let item = list[i];
        whitelistDivContent += `CONTENT: '${item.content}'; 
            <button class="whitelist-activate" onclick="whitelistToggleActivate(${i})">${item.activate ? 'DEACTIVATE' : 'ACTIVATE'}</button><br/>`;
    }
    document.querySelector('#whitelist').innerHTML = whitelistDivContent;
    whitelistDivContent = '';
});

const filterSubmit = () => {
    let content = document.querySelector('#filter-content').value,
        type = document.querySelector('#filter-type').value;
    socket.emit('cmd', {
        command: 'newFilter',
        content,
        type,
        force: filterForce,
        passwd: saltedPassword
    });
};

const whitelistSubmit = () => {
    let content = document.querySelector('#whitelist-content').value;
    socket.emit('cmd', {
        command: 'newWhitelist',
        content,
        passwd: saltedPassword
    });
};