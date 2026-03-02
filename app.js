const express = require("express");  // access
const socket = require("socket.io"); 

const app = express();   //Initialize and server ready


// yeh frontend k index.html ko connect/display krayegi 
app.use(express.static("public")); 

let port = process.env.PORT || 3000;
let server = app.listen(port, () => {
    console.log("Listening to port" + port);
})

// initialize a socket
let io = socket(server);

// whenever connect hoga frontend se toh yha pta chl jayega
// event listener lgega just like we done in frontend 
// in frontend we used "eventListener" and in server side we use "on"

io.on("connection", (socket) => {
    console.log("Made socket connection");

    // server mai connect hone k baad idhr pta bhi chlega ki connect ho chuka hai 
    socket.on("beginPath", (data) => {
        // data -> data from frontend
        // now transfer the same data to all connected computers
        io.sockets.emit("beginPath", data);

    })

    socket.on("drawStroke", (data) => {
        io.sockets.emit("drawStroke", data);
    })

    socket.on("redoUndo", (data) => {
        io.sockets.emit("redoUndo", data);
    })
})