const socket = io();


// Selectors
const nameForm = document.getElementById('name_form');
const msgForm = document.getElementById('msg_form');
const onlineUserList = document.getElementById('onlineUserList');
const createButton = document.getElementById('create_btn');
const roomInputField = document.getElementById('create_room');

const nameField = document.querySelector(".name");
const roomArea = document.querySelector(".room");
const displayName = document.querySelector('.displayName')
const messages = document.querySelector('.messages')
const innerCanvas = document.querySelector(".inner_canvas");
innerCanvas.hidden = true;



// Global Variables Declearation
let activeUsers;
let publicRooms;



// Set Name Event
nameForm.addEventListener('submit',(e) => {
    e.preventDefault();
    const name = nameForm[0].value;
    
    // Validation
    if (!name) return;

    // Socket Event
    socket.emit('setName', name, () => {
        nameField.hidden = true;
        roomArea.hidden = false;
    })
})



// Get Active Users 
socket.on('getActiveUsers', (users) => {
    activeUsers = users;
    onlineUserList.innerHTML = '';

    activeUsers.forEach(user => {
        const li = document.createElement('li');

        li.style.color = "#F5F5F5";
        li.style.background = "#343434";
        li.style.cursor = "pointer";
        li.classList.add('listGroup-item');
        li.classList.add('onLine');

        li.addEventListener('click', () => {
            openCanvas(user);
            messages.innerHTML= ''
        })

        li.textContent = user.id === socket.id ? "You" : user.name;
        li.dataset.id = user.id;
        onlineUserList.appendChild(li);
    })
})



// Send Private Message Event
msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = msgForm[0].value;
    const id = msgForm[1].value;

    // Send Message Event
    if (msg) {
        socket.emit("send_aMsg", { msg, id }, () => {
            
            const li = document.createElement('li')
            li.classList.add('listGroup-item');
            li.style.color = "#F5F5F5";
            li.textContent = "You" + ": " + msg;
            messages.appendChild(li);
            msgForm[0].value = ''
        })
    }
})



// Receive a Message Event
socket.on("received_aMsg", (data, senderId) => {

    const user = activeUsers.find(u => u.id === data.id)
    openCanvas(user);
    const sender = activeUsers.find(u => u.id === senderId)
    openCanvas(sender);



    const li = document.createElement('li')
    li.classList.add('listGroup-item');
    li.style.color = "#F5F5F5";
    li.textContent = sender.name + ": " + data.msg;

    messages.appendChild(li);

})



// Open The Message Canvas
function openCanvas(user) {
    innerCanvas.hidden = false;
    displayName.textContent = user.name;
    msgForm[1].value = user.id;
}



// Create Room Function
createButton.addEventListener('click', (e) => {
    const roomName = roomInputField.value;
    if (roomName) {
        
        // Public Room Event
        socket.emit("create_room", roomName, () => {
            console.log("Fucked Up");
        })
    }
})



// Get Public Rooms
socket.on("getPublicRooms", (publicRooms) => {
    console.log(publicRooms);
})
