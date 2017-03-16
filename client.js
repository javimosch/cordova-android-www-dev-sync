var socket = require('socket.io-client')(process.env.ENDPOINT || 'http://localhost:8082');
var path = require('path');
var sander = require('sander');

var ANDROID_WWW_FOLDER = path.join('/home/ubuntu/workspace/cache/platforms/android/assets/www');

socket.on('connect', function() {
    console.log('connected');
});
socket.on('event', function(data) {});
socket.on('disconnect', function() {});

socket.on('watching', function(params) {
    //console.log('watching',Object.keys(params));
    write(params);
});
socket.on('change', function(params) {
    //console.log('watching',Object.keys(params));
    write(params);
});
socket.on('create', function(params) {
    //console.log('watching',Object.keys(params));
    write(params);
});
socket.on('delete', function(params) {
    console.log('deleting', params.folder, params.path);
    sander.unlinkSync(path.join(ANDROID_WWW_FOLDER, params.folder, params.path));
});

function write(params) {
    console.log('writing', params.folder, params.path);
    sander.writeFileSync(path.join(ANDROID_WWW_FOLDER, params.folder, params.path), params.content);
}
