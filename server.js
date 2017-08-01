var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/client/index.html');
});

app.get('/public/bundle.js', (req, res) => {
  res.sendFile(__dirname + '/src/client/public/bundle.js');
});

io.on('connection', (socket) => {

  let userId = socket.id;
  console.log(userId + ' is connected');

  socket.on('chat message', (msg) => {
    let dataMsg = {
      sender: userId,
      type: 'text',
      content: msg
    };
    io.emit('chat message', dataMsg);
    console.log(userId + ': is writing "' + msg + '"');
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

rl.on('line', (input) => {

  let dataMsg = input === 'buttons yes no' ? {
    type: 'template',
    items: [
      {
        item: "button",
        text: "yes"
      },
      {
        item: "button",
        text: "no"
      }
    ]
  } : {
    sender: 'server-broadcast',
    type: 'text',
    content: input
  };

  io.emit('chat message', dataMsg);

  io.clients((error, clients) => {
    if (error) throw error;
    for (let i = 0; i < clients.length; i++) {
      console.log(clients[i] + ': got "' + input + '"');
    }
  });
});

http.listen(3000, () => {
  console.log('listening on localhost:3000');
});
