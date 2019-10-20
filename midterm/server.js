let port = 8004;
let express = require('express');
let app = express();
let fs = require('fs');



// combined above http server code with tutorial from 
//https://hackernoon.com/set-up-ssl-in-nodejs-and-express-using-openssl-f2529eab5bb
let server = require('https').createServer({
    key: fs.readFileSync('./my-key.pem'),
    cert: fs.readFileSync('./my-cert.pem'),
}, app)
.listen(port, function() {
    console.log('Server listening at port: ', port);
});



app.use(express.static(__dirname + '/public')); 
/* or? app.use(express.static('public')); */

let io = require('socket.io').listen(server);

let rooms = io.sockets.adapter.rooms;
let roomNum = 0;
// How many in a group? Default is 2
let NUM_PARTNERS = 2;

io.sockets.on('connection', 
    function (socket) {
        console.log("We have a new client: " + socket.id);

        joinRoom(socket);

        socket.on('mouse', function (clickDat) {
            console.log(clickDat);
            socket.to(socket.room).emit('mouse', clickDat);
        });

        socket.on('disconnect', function() {
			console.log("Client has disconnected");
        });

        socket.on('radio', function(blob) {
            /*TEST WITH SHAWN*/
            // can choose to broadcast it to whoever you want
            socket.to(socket.room).emit('voice', blob);
            
        });
      

        //TODO: FOR THE FUTURE also T&E
        // socket.on('username', function(senderUsername) {
        //     const { room, id } = socket;
        
        //     let members = rooms[room].sockets;
        //     let receiver;
        
        //     for (member in members) {
        //       if (member != id) {
        //         receiver = member;
        //       }
        //     }
        
        //     socket.broadcast.to(receiver).emit('connectedUsername', senderUsername);
        // });
});

/* TUSHAR & EMILY 
https://github.com/asd0999/live_web/blob/2ce002732c72594cbe81bb18c77b24a4fc92612a/2_week/gibber_chat/server.js#L93
*/

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
    rooms[r].isPrivate = true;
    socket.room = r;
    console.log(rooms);
}

