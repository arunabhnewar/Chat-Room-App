// Dependencies
const express = require('express');
const app = express();
const socket = require('socket.io');
app.use(express.static('public'));


const http = require('http');
const expressHTTPServer = http.createServer(app);
const io = new socket.Server(expressHTTPServer);


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/room.html`)
})



io.on('connection', (socket) => {
    
    // Get Online Users
    const getOnlineUsers = async () => {
        const activeUserSockets = io.sockets.sockets;
        const socketIds = io.sockets.adapter.sids;
        const activeUserArray = [...socketIds.keys()];
        const activeUser = [];

        activeUserArray.forEach(userId => {
            const userSocket = activeUserSockets.get(userId);
            
            if (userSocket.name) {
                activeUser.push(
                    {
                        id: userSocket.id,
                            name: userSocket.name,
                    }
                )
            }
        })

        return activeUser;
    }
    

    // Set Name Event
    socket.on('setName', async (name, callback) => {
        socket.name = name;
        callback();
        const activeUsers = await getOnlineUsers();
        io.emit('getActiveUsers', activeUsers);
    })


    // Disconnect Event
    socket.on('disconnect', async () => {
        const activeUsers = await getOnlineUsers();
        io.emit('getActiveUsers', activeUsers);
    })



    // Send Private Message Event
    socket.on("send_aMsg", (data, callback) => {
        const msg = data.msg;
        const id = data.id;

        io.to(id).emit("received_aMsg", data, socket.id);
        callback()
    })
})



// Server listening
expressHTTPServer.listen(3000, () => {
    console.log("Server has been running on port 3000");
})