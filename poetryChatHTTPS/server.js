let port = 8004;
let express = require('express');
let app = express();
let fs = require('fs');
//let server = require('https')

// let server = require('https').createServer(app).listen(port, function() {
//     console.log('Server listening at port: ', port);
//   });

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

io.sockets.on('connection', 
    function (socket) {
        console.log("We have a new client: " + socket.id);

        socket.on('mouse', function (clickDat) {
            console.log(clickDat);
            socket.broadcast.emit('mouse', clickDat);
        });

        socket.on('disconnect', function() {
			console.log("Client has disconnected");
        });

        socket.on('radio', function(blob) {
            // can choose to broadcast it to whoever you want
            socket.broadcast.emit('voice', blob);
        });
});
