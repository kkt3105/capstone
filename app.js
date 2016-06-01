
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('domain', 'localhost');
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.limit('10mb'));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routing setting
require('./router.js').route(app);

// create connection pool for mysql, just do it once when server has created.
require('./db.js').connect();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
//
var gcm = require('node-gcm');

var message = new gcm.Message();

var message = new gcm.Message({
    collapseKey: 'Gcm Test',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
        data: 'Gcm Receive Success'
    }
});
/*
var server_api_key ='AIzaSyBdvyTF-YfPkjmGS1bwmFriYopBW3IlSGQ';
var sender = new gcm.Sender(server_api_key);
var registrationIds = [];


var token = 'cbVzdSH1RDY:APA91bHzKODcw-d21XlPDE0BcwQ18aDM7DZvOS9YIiT0xhpDLRglPdWVFytiA6wnEishA4zUH63fDK83auSsRIBbmoa0qPVuKpb9is3Od_BqzuymCXgyhMq8u4tDEOMqaJ60oDLWmjR2';
registrationIds.push(token);

sender.send(message, registrationIds, 4, function (err, result) {
    console.log(result);
});
*/
