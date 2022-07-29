const socket = io();


// Selectors
const nameForm = document.getElementById('name_form');
const msgForm = document.getElementById('msg_form');
const onlineUserList = document.getElementById('onlineUserList');
const createButton = document.getElementById('create_btn');
const roomInputField = document.getElementById('create_room');
const publicRoomsAccordion = document.getElementById('accordionExample');

const nameField = document.querySelector(".name");
const roomArea = document.querySelector(".room");
const displayName = document.querySelector('.displayName');
const messages = document.querySelector('.messages');
const modal = document.querySelector(".modal");
const innerCanvas = document.querySelector(".inner_canvas");
innerCanvas.hidden = true;



// Global Variables Declearation
let activeUsers;
let publicAllRooms;



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
            msgForm[1].dataset.room = false;
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
    const isRoom = msgForm[1].dataset.room;

    // Send Message Event
    if (msg) {
        socket.emit("send_aMsg", { msg, id, isRoom }, () => {
            
            const li = document.createElement('li')
            li.classList.add('listGroup-item');
            li.classList.add('senderUser');
            li.style.color = "#F5F5F5";
            li.textContent = "You" + " : " + msg;

            messages.appendChild(li);
            msgForm[0].value = '';
        })
    }
})



// Receive a Message Event
socket.on("received_aMsg", (data, senderId) => {
    const isRoom = data.isRoom;

    const user = activeUsers.find(u => u.id === data.id);
    const sender = activeUsers.find(u => u.id === senderId);
   
    if (isRoom) {
        innerCanvas.hidden = false;
        displayName.textContent = data.id;
        msgForm[1].value = data.id;
        msgForm[1].dataset.room = true;
    } else {
        openCanvas(sender);
        msgForm[1].dataset.room = false;
    }

    const li = document.createElement('li')
    li.classList.add('listGroup-item');
    li.style.color = "#FFC107";
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
            closeModal();
        })
    }
})



// Get Public Rooms
socket.on("getPublicRooms", (publicAllRooms) => {

    publicRoomsAccordion.innerHTML = '';
    
    publicAllRooms.forEach(room => {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add("accordion-item");

        accordionItem.innerHTML = `
        <h2 class="accordion-header" id="${room.id}id">
        <button type="button"
        data-bs-toggle="collapse" 
        class="accordion-button collapsed"
        data-bs-target="#${room.id}option" 
        aria-controls="${room.id}option"
        aria-expanded="false">
        ${room.roomName} (${room.size})

        <span onclick="joinRoom('${room.roomName}')"
        class="material-symbols-outlined accord_icon">
        group_add
        </span>

        <span onclick="leaveRoom('${room.roomName}')"
        class="material-symbols-outlined"> 
        logout 
        </span>

        </button>
        </h2>

        <div
        id="${room.id}option"
        class="accordion-collapse collapse"
        aria-labelledby="${room.id}id"
      >
        <div class="accordion-body">
          <ul id="participants"></ul>
        </div>
      </div>
        `;


        const participantUl = accordionItem.querySelector("#participants");

        room?.participants?.forEach(participant => {
            const li = document.createElement('li');
            li.style.listStyle = "none";
            li.textContent = participant.name;
            participantUl.appendChild(li);
        })

        publicRoomsAccordion.appendChild(accordionItem);
    })
})




// Join Room Function
function joinRoom(roomName) {
    socket.emit("joinRoom", roomName, () => {
        messages.innerHTML = '';
        displayName.textContent = roomName;
        innerCanvas.hidden = false;
        msgForm[1].value = roomName;
        msgForm[1].dataset.room = true;
        
    })
}



// Leave Room Function
function leaveRoom(roomName) {
    socket.emit("leaveRoom", roomName, () => {
        innerCanvas.hidden = true;
    })
}



// Modal Close Function
function closeModal() {
    modal.classList.remove("show");
    modal.style.display = "none";
    roomInputField.value = "";
    document.body.classList.remove("modal-open");
    document.body.style = {};
    document.querySelector(".modal-backdrop")?.remove("show");
}