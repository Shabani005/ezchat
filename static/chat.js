// Function to add a message to the chat
function addMessage(content, isUser) {
    const chatMessages = document.getElementById("chat-messages")
  
    const messageRow = document.createElement("div")
    messageRow.className = `message-row ${isUser ? "user" : "assistant"}`
  
    const messageContainer = document.createElement("div")
    messageContainer.className = "message-container"
  
    const avatar = document.createElement("div")
    avatar.className = `avatar ${isUser ? "user" : "assistant"}`
    avatar.textContent = isUser ? "U" : "AI"
  
    const messageContent = document.createElement("div")
    messageContent.className = "message-content"
  
    // Format the content: handle bold text, remove quotes, and handle newlines
    let formattedContent = content
  
    // Remove quotes at the beginning and end if they exist
    formattedContent = formattedContent.replace(/^"(.*)"$/, "$1")
  
    // Convert **text** to bold
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  
    // Format bullet points (lines starting with *)
    let hasLists = false
  
    // Check if content has bullet points
    if (formattedContent.match(/^\* (.+)$/gm)) {
      hasLists = true
      formattedContent = formattedContent.replace(/^\* (.+)$/gm, '<li class="bullet-item">$1</li>')
    }
  
    // Format numbered lists (lines starting with numbers followed by periods)
    if (formattedContent.match(/^\d+\. (.+)$/gm)) {
      hasLists = true
      formattedContent = formattedContent.replace(/^\d+\. (.+)$/gm, '<li class="number-item">$1</li>')
    }
  
    // If we have lists, wrap them properly
    if (hasLists) {
      // First, temporarily mark list items
      formattedContent = formattedContent.replace(
        /<li class="bullet-item">(.+?)<\/li>/g,
        '###BULLET###<li class="bullet-item">$1</li>###ENDBULLET###',
      )
      formattedContent = formattedContent.replace(
        /<li class="number-item">(.+?)<\/li>/g,
        '###NUMBER###<li class="number-item">$1</li>###ENDNUMBER###',
      )
  
      // Convert \n to <br> (but not inside lists)
      formattedContent = formattedContent.replace(/\\n/g, "<br>")
      formattedContent = formattedContent.replace(/\n/g, "<br>")
  
      // Group consecutive bullet points into a single ul
      let bulletRegex = /(?:###BULLET###<li class="bullet-item">.*?<\/li>###ENDBULLET###)+/g
      formattedContent = formattedContent.replace(
        bulletRegex,
        function (match) {
          return '<ul class="bullet-list">' + match.replace(/###BULLET###|###ENDBULLET###/g, "") + "</ul>"
        },
      )
  
      // Group consecutive numbered points into a single ol
      let numberRegex = /(?:###NUMBER###<li class="number-item">.*?<\/li>###ENDNUMBER###)+/g
      formattedContent = formattedContent.replace(
        numberRegex,
        function (match) {
          return '<ol class="number-list">' + match.replace(/###NUMBER###|###ENDNUMBER###/g, "") + "</ol>"
        },
      )
    } else {
      // If no lists, just convert newlines
      formattedContent = formattedContent.replace(/\\n/g, "<br>")
      formattedContent = formattedContent.replace(/\n/g, "<br>")
    }
  
    // Use innerHTML instead of textContent to render the HTML formatting
    messageContent.innerHTML = formattedContent
  
    messageContainer.appendChild(avatar)
    messageContainer.appendChild(messageContent)
    messageRow.appendChild(messageContainer)
  
    chatMessages.appendChild(messageRow)
  
    // Improved scroll to bottom functionality
    scrollToBottom()
  }
  
  // Function to scroll to the bottom of the chat
  function scrollToBottom() {
    const chatMessages = document.getElementById("chat-messages")
    
    // Use setTimeout to ensure the scroll happens after the DOM is updated
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }, 10)
  }
  
  // Load models into the selector
  async function loadModels() {
    const modelSelector = document.getElementById("model-selector")
    const modelsResponseElement = document.getElementById("modelsresponse")
  
    try {
      // Fetch the models.json file directly
      const response = await fetch("/models.json")
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const models = await response.json()
      modelsResponseElement.textContent = JSON.stringify(models, null, 2)
  
      // Clear existing options except the first one
      while (modelSelector.options.length > 1) {
        modelSelector.remove(1)
      }
  
      // Add models to the selector
      if (Array.isArray(models)) {
        models.forEach((model) => {
          const option = document.createElement("option")
          option.value = model
          option.textContent = model
          modelSelector.appendChild(option)
        })
  
        // Select the first model by default if none is selected
        if (modelSelector.value === "") {
          modelSelector.selectedIndex = 1
        }
  
        // Enable the selector
        modelSelector.disabled = false
      } else {
        // If no models found, add a placeholder
        const option = document.createElement("option")
        option.value = ""
        option.textContent = "No models available"
        modelSelector.appendChild(option)
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      modelsResponseElement.textContent = "Error fetching models: " + error.message
  
      // Add a placeholder option
      const option = document.createElement("option")
      option.value = ""
      option.textContent = "Error loading models"
      modelSelector.appendChild(option)
      
      // Add fallback models in case the file can't be loaded
      const fallbackModels = ["gemma-3-1b-it", "gemma-3-12b-it", "text-embedding-nomic-embed-text-v1.5"]
      fallbackModels.forEach((model) => {
        const option = document.createElement("option")
        option.value = model
        option.textContent = model
        modelSelector.appendChild(option)
      })
      
      // Select the first fallback model
      if (modelSelector.options.length > 1) {
        modelSelector.selectedIndex = 1
      }
    }
  }
  
  // Send message to API
  document.getElementById("sendtolmst").addEventListener("click", async () => {
    const userInput = document.getElementById("user").value
    if (!userInput.trim()) return
  
    const modelSelector = document.getElementById("model-selector")
    const selectedModel = modelSelector.value
  
    if (!selectedModel) {
      alert("Please select a model first")
      return
    }
  
    const lmstResponseElement = document.getElementById("lmstresponse")
  
    // Add user message to chat
    addMessage(userInput, true)
  
    // Clear input field
    document.getElementById("user").value = ""
  
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          model: selectedModel,
        }),
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const data = await response.json()
  
      // Display the API response in the debug panel
      lmstResponseElement.textContent = JSON.stringify(data, null, 2)
  
      // Add AI response to chat (assuming the response has a 'content' field)
      if (data.content) {
        addMessage(data.content, false)
      } else {
        // If the response format is different, display the raw response
        addMessage(JSON.stringify(data), false)
      }
      
      // Ensure we scroll to the bottom after adding the AI response
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
      lmstResponseElement.textContent = "Error sending message: " + error.message
      addMessage("Error: " + error.message, false)
      scrollToBottom()
    }
  })
  
  // Get models
  document.getElementById("getmodels").addEventListener("click", async () => {
    loadModels()
  })
  
  // Toggle debug panel
  document.getElementById("debug-toggle").addEventListener("click", () => {
    const debugPanel = document.getElementById("debug-panel")
    debugPanel.classList.toggle("hidden")
  })
  
  // Allow sending message with Enter key
  document.getElementById("user").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("sendtolmst").click()
    }
  })
  
  // Add a scroll to bottom button
  function addScrollButton() {
    const scrollButton = document.createElement("button")
    scrollButton.id = "scroll-bottom"
    scrollButton.className = "scroll-bottom-button hidden"
    scrollButton.innerHTML = "↓"
    scrollButton.title = "Scroll to bottom"
    
    document.body.appendChild(scrollButton)
    
    // Show/hide the button based on scroll position
    const chatMessages = document.getElementById("chat-messages")
    chatMessages.addEventListener("scroll", () => {
      const isScrolledUp = chatMessages.scrollTop < chatMessages.scrollHeight - chatMessages.clientHeight - 100
      scrollButton.classList.toggle("hidden", !isScrolledUp)
    })
    
    // Scroll to bottom when clicked
    scrollButton.addEventListener("click", () => {
      scrollToBottom()
    })
  }
  
  // Add a welcome message when the page loads
  window.addEventListener("load", () => {
    addMessage(
      "Hey there! How's your day going so far? 😊\n\nWhat's on your mind? Do you want to:\n\n* Talk about something specific?\n* Play a game?\n* Get some information?\n\nPlease select a model from the dropdown above to get started.",
      false,
    )
    
    // Add scroll to bottom button
    addScrollButton()
  
    // Load models when the page loads
    loadModels()
    
    // Make sure the input is always visible
    const inputWrapper = document.querySelector(".input-wrapper")
    if (inputWrapper) {
      const inputWrapperHeight = inputWrapper.offsetHeight
      document.documentElement.style.setProperty('--input-height', `${inputWrapperHeight}px`)
    }
  })
  
  // Window resize handler to adjust the chat container height
  window.addEventListener("resize", () => {
    const inputWrapper = document.querySelector(".input-wrapper")
    if (inputWrapper) {
      const inputWrapperHeight = inputWrapper.offsetHeight
      document.documentElement.style.setProperty('--input-height', `${inputWrapperHeight}px`)
    }
  })
  
  console.log("chat.js loaded")
  