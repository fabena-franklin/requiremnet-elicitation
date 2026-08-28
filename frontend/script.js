const API_URL = "http://127.0.0.1:8000";
const GREETING = "Hey! Welcome to No Idea. Tell me your idea and we will shape it into an MVP.";

let sessionId = null;

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

function updateProgress(progress) {
    const percent = Math.max(0, Math.min(100, progress));
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
}

// ============================================
// ADD MESSAGE
// ============================================

function addMessage(message, sender) {
const messageDiv = document.createElement("div");

messageDiv.className = `message ${sender}`;

if (sender === "bot") {

    messageDiv.innerHTML = `
        <div class="avatar">✦</div>
        <div class="message-content"></div>
    `;

} else {

    messageDiv.innerHTML = `
        <div class="message-content"></div>
    `;
}

const content =
    messageDiv.querySelector(".message-content");

content.textContent = message;

chatBox.appendChild(messageDiv);

chatBox.scrollTop = chatBox.scrollHeight;

}

// ============================================
// TYPING INDICATOR
// ============================================

function showTyping() {
removeTyping();

const typing = document.createElement("div");

typing.id = "typing";

typing.className = "message bot";

typing.innerHTML = `
    <div class="avatar">✦</div>

    <div class="message-content">

        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>

    </div>
`;

chatBox.appendChild(typing);

chatBox.scrollTop = chatBox.scrollHeight;

}

function removeTyping() {
const typing =
    document.getElementById("typing");

if (typing) {
    typing.remove();
}

}

// ============================================
// SEND MESSAGE
// ============================================

async function sendMessage() {
const message = input.value.trim();

if (!message) {
    return;
}

const isFirstMessage = sessionId === null;
const isGreeting = [
    "hello", "hi", "hey", "hlo", "helo", "hii",
    "hello!", "hi!", "hey!", "hlo!", "helo!", "hii!"
].includes(
    message.toLowerCase()
);

// Remove welcome screen

const welcome =
    document.getElementById("welcome");

if (welcome) {
    welcome.remove();
}

if (isFirstMessage && !isGreeting) {
    addMessage(GREETING, "bot");
}

// Display user message

addMessage(message, "user");


// Clear input

input.value = "";

input.style.height = "auto";


// Disable button

sendButton.disabled = true;


// Show typing

showTyping();


try {

    const response = await fetch(
        `${API_URL}/chat`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                session_id: sessionId,
                message: message
            })
        }
    );


    // Check HTTP status

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Server error ${response.status}: ${errorText}`
        );
    }


    // Convert response to JSON

    const data =
        await response.json();


    // Store session ID

    sessionId = data.session_id;
    updateProgress(data.progress);


    // Remove typing indicator

    removeTyping();


    // Display AI response

    addMessage(
        data.message,
        "bot"
    );


} catch (error) {

    console.error(
        "Chat error:",
        error
    );


    removeTyping();


    addMessage(
        "I couldn't connect to the local AI server. Please make sure FastAPI and Ollama are running.",
        "bot"
    );

}


// Re-enable button

sendButton.disabled = false;

input.focus();

}

// ============================================
// EXAMPLE IDEA
// ============================================

function startExample(text) {
input.value = text;

sendMessage();

}

// ============================================
// ENTER KEY
// ============================================

function handleKey(event) {
// Enter = send
// Shift + Enter = new line

if (
    event.key === "Enter" &&
    !event.shiftKey
) {

    event.preventDefault();

    sendMessage();
}

}

// ============================================
// NEW CONVERSATION
// ============================================

function newConversation() {
sessionId = null;
updateProgress(0);


chatBox.innerHTML = `
    <div id="welcome" class="welcome">

        <div class="welcome-logo">
            ✦
        </div>

        <h1>Hey! Welcome to No Idea.</h1>

        <p>
            Tell me your idea and we will shape it into an MVP.
        </p>

    </div>
`;


input.value = "";

input.focus();

}

// ============================================
// CLEAR CONVERSATION
// ============================================

function clearConversation() {
sessionId = null;
updateProgress(0);

chatBox.innerHTML = "";

input.value = "";

input.focus();

}
