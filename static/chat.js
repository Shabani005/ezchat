document.getElementById('sendtolmst').addEventListener('click', async function() {
    const userInput = document.getElementById('user').value;
    const lmstResponseElement = document.getElementById('lmstresponse');

    try {
        const response = await fetch('/', { // Assuming your Flask route is at '/'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        lmstResponseElement.textContent = JSON.stringify(data); // Display the API response
    } catch (error) {
        console.error('Error sending message:', error);
        lmstResponseElement.textContent = 'Error sending message: ' + error.message;
    }
});

document.getElementById('getmodels').addEventListener('click', async function() {
    const modelsResponseElement = document.getElementById('modelsresponse');

    try {
        const response = await fetch('http://localhost:5555/v1/models');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        modelsResponseElement.textContent = JSON.stringify(data);
    } catch (error) {
        console.error('Error fetching models:', error);
        modelsResponseElement.textContent = 'Error fetching models: ' + error.message;
    }
});

console.log('chat.js loaded');