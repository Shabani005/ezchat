document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user');
    const sendButton = document.getElementById('sendtolmst');
    const modelsButton = document.getElementById('getmodels');

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';

        // Send to server
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                addMessage('Error: ' + data.error);
            } else {
                addMessage(data.response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            addMessage('Error: Failed to send message');
        });
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Get models button
    modelsButton.addEventListener('click', function() {
        fetch('/models')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                addMessage('Error: ' + data.error);
            } else {
                addMessage('Available models: ' + data.models.join(', '));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            addMessage('Error: Failed to fetch models');
        });
    });
});

console.log('chat.js loaded');