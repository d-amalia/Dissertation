var fs = require('fs');
var express = require('express');
var path = require('path');
var app = express();

var https = require('https');
var privateKey = fs.readFileSync('sslcert/server-key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/server-cert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var path = require('path');
var app = express();
var httpsServer = https.createServer(credentials, app);

var io = require('socket.io')(httpsServer);
var port = 8443;
var users = [];

app.use(express.static(path.join(__dirname, "public")));

// Connect to socket => new user
io.on('connection', function (socket) {
    console.log('a user connected');  

    // Disconnect from socket, updates when user leaves
    socket.on('disconnect', function () {
        users = users.filter(function (item) {
            return item.nickname !== socket.nickname;
        });
        console.log(socket.nickname + " disconnected");
        //Emit with updated users array
        io.emit('all-users', users);
    })

    // When new socket/user joins
    // Add new user to users array
    // Emit all-users to see the updates array
    socket.on('join', function (data) {
        console.log(data); //nickname and image
        socket.nickname = data.nickname;
        users[socket.nickname] = socket;        
        var userObj = {
            nickname: data.nickname,
            image: 'http://dummyimage.com/250x250/000/fff&text=' + data.nickname.charAt(0).toUpperCase(),
            socketid: socket.id
        }
        users.push(userObj);
        io.emit('all-users', users);
    })

    //show all users when first joined 
    socket.on('get-users', function () {
        //passing the users array
        socket.emit('all-users', users);
    });

  
    socket.on('create-private-room', function (data) {
        var newPrivateRoom = ("" + Math.random()).substring(2, 7);
        socket.join(newPrivateRoom);
        socket.currentRoom = newPrivateRoom;
        data.newPrivateRoom = newPrivateRoom;
        socket.broadcast.to(data.to).emit('join-private-room-request', data)
        socket.emit('update-chat', 'server', data);

    });

    socket.on('accept-private-room-request', function (data) {
        socket.join(data.newPrivateRoom);
        socket.currentRoom = data.newPrivateRoom;
        io.sockets.in(socket.currentRoom).emit('update-chat', 'server', data);

    })

    socket.on('send-private-message', function (newMessage) {
        io.sockets.in(socket.currentRoom).emit('message-received', newMessage);
    })
});

httpsServer.listen(port, function () {
    console.log("Listening on port " + port);
});
