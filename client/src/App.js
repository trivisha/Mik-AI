import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);


 
  

  const [sessionId, setSessionId] = useState(() => {
    const existing = localStorage.getItem("chat-session");
    if (existing) return existing;

    const newId = Math.random().toString(36).substring(2, 10);
    localStorage.setItem("chat-session", newId);
    return newId;
  });

  const chatEndRef = useRef(null);

 const sendMessage = async () => {
  if (!message.trim()) return;

  const userMsg = { sender: "user", text: message };
  setChat((prev) => [...prev, userMsg]);
  setMessage("");

  const history = [...chat, userMsg]
    .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
    .join("\n");

  const fullPrompt = `You are a helpful assistant.\n${history}\nUser: ${message}\nAssistant:`;

  setTyping(true); // ✅ Start Typing
  setChat((prev) => [...prev, { sender: "bot", text: "🤖 Typing..." }]); // Show Typing msg

  const res = await fetch("https://mik-ai-server.onrender.com/api/together/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: fullPrompt, sessionId }),
  });

  const data = await res.json();
  setTyping(false); // ✅ Stop Typing

  setChat((prev) => [
    ...prev.slice(0, -1), // remove last Typing message
    { sender: "bot", text: data.reply },
  ]);
};

const handleFileUpload = async (file) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  const question = prompt("Ask something about this file:");
  formData.append("question", question || "Summarize this file");
  formData.append("sessionId", sessionId);

  // ✅ Show uploaded message
  setChat((prev) => [
    ...prev,
    { sender: "user", text: `📎 Uploaded: ${file.name}\n❓ ${question}` },
    { sender: "bot", text: "🤖 Typing..." }, // show Typing...
  ]);

  setLoading(true);
  setTyping(true);

  const res = await fetch("https://mik-ai-server.onrender.com/api/together/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  setLoading(false);
  setTyping(false);

  setChat((prev) => [
    ...prev.slice(0, -1), // remove "Typing..."
    { sender: "bot", text: data.reply },
  ]);
};

 


  const fetchAllSessions = async () => {
    const res = await fetch("https://mik-ai-server.onrender.com/api/together/sessions");
    const data = await res.json();
    setSessions(data);
  };

  const loadSession = async (selectedId) => {
    setLoadingSession(true);
    const res = await fetch(`https://mik-ai-server.onrender.com/api/together/history/${selectedId}`);
    const data = await res.json();
    const loadedChat = data.map((msg) => ({
      sender: msg.sender,
      text: msg.content
    }));
    setChat(loadedChat);
    setMessage("");
    localStorage.setItem("chat-session", selectedId);
    setSessionId(selectedId); // update current session
    setLoadingSession(false);
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <h2>🤖 MIK-AI Chatbot</h2>

      {/* 🌗 Dark/Light Toggle */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          Toggle {darkMode ? "☀️ Light" : "🌙 Dark"} Mode
        </button>
      </div>

       {/* ⏳ Show loading message if true */}
    {loading && (
      <div style={{ textAlign: "center", color: "gray", marginBottom: "10px" }}>
        ⏳ Processing file...
      </div>
    )}

      {/* 🗂️ Session History */}
      <div className="sidebar">
        <h4>🗂️ Previous Sessions</h4>
        <ul>
          {sessions.map((id, index) => (
            <li key={index}>
              <button onClick={() => loadSession(id)} disabled={loadingSession}>
                {id}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 💬 Chat Box */}
      <div className="chat-box">
        {chat.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <div className="avatar">{msg.sender === "user" ? "👩‍💻" : "🤖"}</div>
            <div className={`bubble ${msg.text === "🤖 Typing..." ? "typing" : ""}`}>
  {msg.text}
</div>

          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* ✍️ Input */}

      <input
  type="file"
  accept=".pdf,.txt,.docx"
  onChange={(e) => handleFileUpload(e.target.files[0])}
/>


      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
