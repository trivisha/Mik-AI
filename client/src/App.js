import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);

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
    setChat([...chat, userMsg]);
    setMessage("");

    const history = [...chat, userMsg]
      .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `You are a helpful assistant.\n${history}\nUser: ${message}\nAssistant:`;

    const res = await fetch("http://localhost:5000/api/together/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt, sessionId }),
    });

    const data = await res.json();
    const botMsg = { sender: "bot", text: data.reply };
    setChat((prev) => [...prev, botMsg]);
  };

  const fetchAllSessions = async () => {
    const res = await fetch("http://localhost:5000/api/together/sessions");
    const data = await res.json();
    setSessions(data);
  };

  const loadSession = async (selectedId) => {
    setLoadingSession(true);
    const res = await fetch(`http://localhost:5000/api/together/history/${selectedId}`);
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
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* ✍️ Input */}
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
