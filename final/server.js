let port = 8009;
let express = require('express');
let app = express();
let fs = require('fs');


let server = require('https').createServer({
    key: fs.readFileSync('./my-key.pem'),
    cert: fs.readFileSync('./my-cert.pem'),
}, app)
.listen(port, function() {
    console.log('Server listening at port: ', port);
});

app.use(express.static(__dirname + '/public')); 

let io = require('socket.io').listen(server);

let rooms = io.sockets.adapter.rooms;
let roomNum = 0;
// How many in a group? Default is 2
let NUM_PARTNERS = 2;

io.sockets.on('connection', 
    function (socket) {
        console.log("We have a new client: " + socket.id);

        joinRoom(socket);
        
        socket.emit('ready', rooms[socket.room].length === 2)

        socket.on('disconnect', function() {
          console.log("Client has disconnected", socket.id);
        });

        socket.on('radio', function(blob) {
            // can choose to broadcast it to whoever you want
            socket.broadcast.emit('voice', blob);
        });

        socket.on('heardAnswer', function() {
          socket.broadcast.emit('answerHeard')
        });

        socket.on('letsGo', () => {
          socket.broadcast.emit('nextQuestion', 0)
        })

        socket.on('partnerNext', function(index) {
          console.log('nextQuestion', index)
          socket.broadcast.emit('nextQuestion', index);
        });
});

function joinRoom(socket) {
    // First, add client to incomplete rooms
    for (let r in rooms) {
      let room = rooms[r];
      if (room.isPrivate) {
          if (room.length < NUM_PARTNERS) {
        addSocketToRoom(socket, r);
        return;
    
      }
    }
    }
    // If there are no incomplete rooms, create new room and join it
    addSocketToRoom(socket, roomNum);
    roomNum++;
}
  
  // Add client to room and record which room it was added to
function addSocketToRoom(socket, r) {
    socket.join(r);
    rooms[r].isPrivate = rooms[r].length === 2;
    //rooms[r].isPrivate = true;
    socket.room = r;

    //emit ready here? or in connection socket above? 
  
    console.log(rooms);
}

