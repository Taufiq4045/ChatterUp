// socket code in JS
const socket = io.connect('http://localhost:3000');
const username = prompt('Enter your name');
if (!username) location.reload();

const mutationCallback = (mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      const addedNodes = Array.from(mutation.addedNodes);
      const removedNodes = Array.from(mutation.removedNodes);

      // Update count based on added and removed nodes
      connectedUsersCount += addedNodes.filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      ).length;
      connectedUsersCount -= removedNodes.filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      ).length;

      // Update UI
      updateConnectedUsersCount();
    }
  }
};

const observer = new MutationObserver(mutationCallback);
const chatContainer = document.querySelector('.chat-container');
const chatList = document.querySelector('.chat-list');
observer.observe(chatList, { childList: true });

var imageUrls = [
  'https://lh5.googleusercontent.com/-7ssjf_mDE1Q/AAAAAAAAAAI/AAAAAAAAASo/tioYx2oklWEHoo5nAEyCT-KeLxYqE5PuQCLcDEAE/s100-c-k-no-mo/photo.jpg',
  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/8367221/pexels-photo-8367221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/2474307/pexels-photo-2474307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/3564412/pexels-photo-3564412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/2919367/pexels-photo-2919367.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/14526673/pexels-photo-14526673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
];

let connectedUsersCount = 0;

const updateConnectedUsersCount = () => {
  const countElement = document.getElementById('connectedUsersCount');
  countElement.textContent = `Connected Users ${connectedUsersCount}`;
};

const getRandomImageUrl = () => {
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  return imageUrls[randomIndex];
};

// Prepare the data object to emit
const data = {
  username: username,
  imageUrl: getRandomImageUrl(),
};

const getTimeString = (timestamp) => {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
};

const createMessageElement = (messageData, isMyMessage) => {
  const messageElement = document.createElement('div');
  let messageContent;

  if (isMyMessage) {
    messageElement.classList.add('message-box', 'my-message');
    messageContent = `
    <div class="message-content">
      <p><strong>${messageData.username}</strong><br />${
      messageData.message
    }<br /><span>${getTimeString(messageData.timestamp)}</span></p>
    </div>
    <img class="user-img" src="${messageData.imageUrl}" alt="User Image" />
  `;
  } else {
    messageElement.classList.add('message-box', 'friend-message');
    messageContent = `
    <img class="user-img" src="${messageData.imageUrl}" alt="User Image" />
    <div class="message-content">
      <p><strong>${messageData.username}</strong><br />${
      messageData.message
    }<br /><span>${getTimeString(messageData.timestamp)}</span></p>
    </div>
  `;
  }

  messageElement.innerHTML = messageContent;
  return messageElement;
};

const updateUserInfo = (username, imageUrl) => {
  const chatBox = document.createElement('div');
  chatBox.classList.add('chat-box');

  const userContent = `
    <div class="img-box">
      <img
        class="img-cover"
        src="${imageUrl}"
        alt="User Image"
      />
    </div>
    <div class="chat-details">
      <div class="text-head">
        <h4>${username}</h4>
        <b></b>
      </div>
    </div>
  `;
  chatBox.innerHTML = userContent;
  return chatBox;
};

const sendMessage = (message) => {
  socket.emit('new_message', message);
  const messageElement = createMessageElement(
    { username, message, timestamp: Date.now(), imageUrl: data.imageUrl },
    true
  );
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

const loadAndDisplayUsers = (users) => {
  users.forEach((user) => {
    if (user.username === username) data.imageUrl = user.imageUrl;
    const chatElement = updateUserInfo(user.username, user.imageUrl);
    chatList.appendChild(chatElement);
  });
  chatList.scrollTop = chatList.scrollHeight;
};

const loadAndDisplayMessages = (messages) => {
  messages.forEach((message) => {
    const messageElement = createMessageElement(
      message,
      message.username === username
    );
    chatContainer.appendChild(messageElement);
  });

  const welcomeMessageElement = document.createElement('div');
  welcomeMessageElement.classList.add('welcome-message');
  welcomeMessageElement.innerText = `Welcome ${username}`;
  chatContainer.appendChild(welcomeMessageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

const displayMessage = (userMessage) => {
  const welcomeMessageElement = document.createElement('div');
  welcomeMessageElement.classList.add('welcome-message');
  welcomeMessageElement.innerText = userMessage;
  chatContainer.appendChild(welcomeMessageElement);
};

const disconnectUser = (userDetail) => {
  const chatDetails = document.querySelectorAll('.chat-details');
  chatDetails.forEach((detail) => {
    const h4 = detail.querySelector('h4');
    if (h4.textContent === userDetail.username) {
      detail.parentElement.remove();
    }
  });
};

socket.emit('join', { username, imageUrl: data.imageUrl });

const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('input');
const typingStatus = document.getElementById('typingStatus');
let typingTimer;

input.addEventListener('input', function () {
  const message = input.value.trim();
  if (message) {
    typingStatus.textContent = `${data.username} typing...`;
    clearTimeout(typingTimer); // Clear previous timer
    typingTimer = setTimeout(function () {
      typingStatus.textContent = 'Online';
    }, 1000);
  } else {
    typingStatus.textContent = 'Online';
  }
});

sendBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (message) {
    sendMessage(message);
    input.value = '';
  }
});

socket.on('load_users', loadAndDisplayUsers);
socket.on('load_messages', loadAndDisplayMessages);
socket.on('broadcast_message', (userMessage) => {
  if (!userMessage.imageUrl) {
    displayMessage(userMessage);
  } else {
    if (!userMessage.timestamp) {
      disconnectUser(userMessage);
    } else {
      const messageElement = createMessageElement(
        userMessage,
        userMessage.username === username
      );
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
});
