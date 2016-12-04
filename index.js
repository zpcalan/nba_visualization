var http = require('http');
var server = http.createServer();
var path = require('path');

var express=require('express')
var app=express()
app.use(express.static('public'))
var server = app.listen(8089, function () {
    var host = server.address().address;
    var port = server.address().port;
    app.get('/matrix', function(req, res) {
        // 这里路径必须是绝对文件路径
        // 所以要加/public
        res.sendFile(path.join(__dirname, 'public/index/win-lost-matrix.html'))
    });
    console.log('Example app listening at http://%s:%s', host, port);
});