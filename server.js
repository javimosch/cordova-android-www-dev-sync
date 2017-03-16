var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var Watch = require('fs-watcher').watch;
var shortid = require('shortid');
var sander = require('sander');

//var ASSETS_FOLDER = path.join('/home/ubuntu/workspace/cache/platforms/android/assets/www/js');
var ASSETS_FOLDER = path.join('/home/ubuntu/workspace/cache/www');

var listeners = {};
var commands = [];

watch('js');
watch('css');

function addCommand(type, path, folder) {
    var command = {
        type: type,
        path: path,
        folder: folder,
        listeners: {}
    };
    commands.push(command);
    for (var x in listeners) {
        listeners[x](command, commands.length - 1);
    }
}

function sendCommand(client, command, commandIndex) {
    var content = '';

    if (command.type !== 'delete') {
        try {
            content = sander.readFileSync(path.join(ASSETS_FOLDER, command.folder, command.path));
        }
        catch (err) {
            console.log('sendCommand fail', command.type, command.folder, command.path);
            return;
        }
    }

    var payload = {
        path: command.path,
        folder: command.folder,
        content: content
    };
    console.log('CLIENT SEND', command.type, command.folder, command.path, 'content', payload.content.length);
    client.emit(command.type, payload);
    commands[commandIndex].listeners[client._id] = true;
}

function watch(folder) {
    var ignore = (o) => {
        return (o.path === 'Untitled') || o.path === './';
    };
    var _watch = new Watch({
        root: path.join(ASSETS_FOLDER, folder),
        interval: 500
    });
    _watch.on('create', function(o) {
        if (ignore(o)) return;
        addCommand('create', o.path, folder);
        //console.log("FS-WATCH CREATE: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });
    _watch.on('watching', function(o) {
        if (ignore(o)) return;
        addCommand('watching', o.path, folder);
        //console.log("FS-WATCH Watching: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });
    _watch.on('change', function(o) {
        if (ignore(o)) return;
        addCommand('change', o.path, folder);
        //console.log("FS-WATCH Change: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });
    _watch.on('delete', function(o) {
        if (ignore(o)) return;
        addCommand('delete', o.path, folder);
        //console.log("FS-WATCHDelete: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });

    _watch.on('error', function(_err) {
        //addCommand('watching',o.path);
        //console.log("FS-WATCH Error: ", err);
    });

    _watch.start();
}



io.on('connection', function(client) {
    var id = shortid.generate();
    console.log('new client');
    client._id = id;
    for (var x in commands) {
        if (commands[x].listeners && !commands[x].listeners[id]) {
            sendCommand(client, commands[x], x);
        }
    }


    listeners[id] = (command, commandIndex) => {
        sendCommand(client, command, commandIndex);
    };

    client.on('event', function(data) {});
    client.on('disconnect', function() {
        delete listeners[id];
    });

});
server.listen(8082); //process.env.PORT
