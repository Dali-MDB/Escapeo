// Example frontend code for interacting with the messaging API
// This is a simplified example and should be adapted to your actual frontend framework

// Fetch direct conversations
async function getDirectConversations() {
    const response = await fetch('/api/direct-conversations/');
    const data = await response.json();
    return data;
}

// Fetch group conversations
async function getGroupConversations() {
    const response = await fetch('/api/group-conversations/');
    const data = await response.json();
    return data;
}

// Get messages for a conversation
async function getMessages(conversationType, conversationId) {
    const response = await fetch(`/api/${conversationType}-conversations/${conversationId}/messages/`);
    const data = await response.json();
    return data;
}

// Send a message
async function sendMessage(conversationType, conversationId, content) {
    const response = await fetch(`/api/${conversationType}-conversations/${conversationId}/send_message/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    });
    const data = await response.json();
    return data;
}

// Join a group conversation
async function joinGroupConversation(conversationId) {
    const response = await fetch(`/api/group-conversations/${conversationId}/join/`, {
        method: 'POST',
    });
    const data = await response.json();
    return data;
}

// Create a support ticket
async function createSupportTicket(subject, description) {
    const response = await fetch('/api/support-tickets/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, description }),
    });
    const data = await response.json();
    return data;
}

// Get conversation for a ticket (for admin or customer)
async function getTicketConversation(ticketId) {
    const response = await fetch(`/api/support-tickets/${ticketId}/conversation/`);
    const data = await response.json();
    return data;
}

// Example WebSocket connection for real-time messaging
function connectWebSocket(conversationId) {
    // Check if browser supports WebSocket
    if ('WebSocket' in window) {
        // Create WebSocket connection
        const socket = new WebSocket(`ws://${window.location.host}/ws/chat/${conversationId}/`);
        
        // Connection opened
        socket.addEventListener('open', (event) => {
            console.log('WebSocket connection established');
        });
        
        // Listen for messages
        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Message from server:', data);
            // Update UI with new message
            displayMessage(data);
        });
        
        // Connection closed
        socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed');
        });
        
        // Return socket for sending messages
        return socket;
    } else {
        console.error('WebSocket NOT supported by your browser!');
        return null;
    }
}

// Example function to send message via WebSocket
function sendWebSocketMessage(socket, message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            'message': message
        }));
    } else {
        console.error('WebSocket is not open');
    }
}

// Example function to display message in UI
function displayMessage(data) {
    // Example implementation - adapt to your UI framework
    const messagesContainer = document.getElementById('messages-container');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    // Set different style if message is from current user
    if (data.sender_id === currentUserId) {
        messageElement.className += ' own-message';
    }
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="sender">${data.sender_name}</span>
            <span class="timestamp">${new Date(data.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${data.message}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}