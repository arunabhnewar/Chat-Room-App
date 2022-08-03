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
    

    // Get Rooms
    const getPublicRooms = async () => {
        const rooms = await io.sockets.adapter.rooms;
        const socketIds = await io.sockets.adapter.sids;
        const allSockets = await io.sockets.sockets;

        const roomKeys = [... rooms.keys()];
        const socketIdsKeys = [... socketIds.keys()];
        
        const publicRooms = [];
        let roomId = 0;

        for (let roomName of roomKeys) {
            if (!socketIdsKeys.includes(roomName)) {
                const participantSet = rooms.get(roomName);
                const size = participantSet.size;

                const participants = []

                for (let participantId of [...participantSet]) {
                    const userSocket = allSockets.get(participantId);
                    participants.push({
                        id: userSocket.id,
                        name: userSocket.name
                    })
                }

                publicRooms.push({
                    id: "fucker" + roomId + Date.now(),
                    roomName,
                    size,
                    participants
                })
                ++roomId;
            }
        }
        return publicRooms;
}


    // Set Name Event
    socket.on('setName', async (name, callback) => {
        socket.name = name;
        callback();
        const activeUsers = await getOnlineUsers();
        io.emit('getActiveUsers', activeUsers);

        const publicRooms = await getPublicRooms();
        io.emit("getPublicRooms", publicRooms);
    })


    // Disconnect Event
    socket.on('disconnect', async () => {
        const activeUsers = await getOnlineUsers();
        io.emit('getActiveUsers', activeUsers);

        const publicRooms = await getPublicRooms();
        io.emit("getPublicRooms", publicRooms)
    })


    // Send Private Message Event
    socket.on("send_aMsg", (data, callback) => {
        const msg = data.msg;
        const id = data.id;
        const isRoom = data.isRoom === "false" ? false : data.isRoom;
        data.isRoom = isRoom;
    
        
        if (isRoom) {
            socket.to(id).emit("received_aMsg", data, socket.id);
            callback();
        } else {
            io.to(id).emit("received_aMsg", data, socket.id);
            callback();
        }
    })


    // Create A Public Room
    socket.on("create_room", async (roomName, callback) => {
        socket.join(roomName);
        
        const publicRooms = await getPublicRooms();
        io.emit("getPublicRooms", publicRooms);
        callback();
    })


    // Join A Room 
    socket.on("joinRoom", async (roomName, callback) => {
        socket.join(roomName);

        const publicRooms = await getPublicRooms();
        io.emit("getPublicRooms", publicRooms);
        callback();
    })


    // Leave A Room
    socket.on("leaveRoom", async (roomName, callback) => {
        socket.leave(roomName);

        const publicRooms = await getPublicRooms();
        io.emit("getPublicRooms", publicRooms);
        callback();
    })
})



// Server listening
expressHTTPServer.listen(process.env.PORT, () => {
    console.log("Server has been running on port 3000");
})