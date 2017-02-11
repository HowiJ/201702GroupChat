var express = require('express'),
    path    = require('path'),
    app     = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.get('/', function(req, res) {
  res.render('index');
})

var server = app.listen(8000, function() {
  console.log('Group Chat demo Feb 2017 on 8000');
})

var messages = [],
    users    = {};

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
  console.log("We're using sockets!", socket.id);
  io.emit('message_receive', {messages: messages});

  socket.on('message_send', function(data) {
    console.log('data:', data);
    data.user = users[socket.id];
    data.message = data.message.split('<').join('&lt;');
    messages.push(data);
    console.log(messages);
    io.emit('message_receive', {messages: messages});
  })

  socket.on('user_send', function(data) {
    // console.log(data);
    if (!data.user) {
      socket.emit('invalidUser', {success: false});
    } else {
      users[socket.id] = data.user;
      console.log(users);
      io.emit('user_receive', {users: users});
    }
  })

  socket.on('disconnect', function() {
    console.log('DISCONNECTING', socket.id);
    if (users[socket.id]) {
      delete users[socket.id];
      io.emit('user_receive', {users: users});
    }
  })
})