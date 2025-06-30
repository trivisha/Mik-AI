# 🤖 MIK-AI Chatbot

MIK-AI is a full-stack AI-powered chatbot that allows users to chat with a smart assistant, upload documents for analysis, and view previous chat sessions. Built using **React**, **Node.js**, **MongoDB**, and **Together API**, it offers a smooth, modern experience with dark/light themes and session memory.

---

## 🌟 Features

### 🔹 Core Chat Functionality
- Chat with an AI-powered assistant
- Real-time message updates
- Typing animation (`🤖 Typing...`)

### 🔹 File Upload Support
- Upload `.pdf`, `.docx`, `.txt` files
- Ask questions about the file (e.g., "Summarize this file")
- AI reads the file and responds contextually
- Temporary file storage using `multer`
- File content parsed using `pdf-parse`, `mammoth`, and `fs`

### 🔹 Session History
- Unique session ID is created and saved in `localStorage`
- View and revisit previous chat sessions
- Session messages are saved to MongoDB

### 🌗 Dark/Light Mode
- Toggle between light and dark themes

### 💾 MongoDB Integration
- Chat messages and session IDs are stored using MongoDB Atlas
- Schema includes message sender, content, timestamp, and sessionId

---

## 🛠️ Tech Stack

| Frontend       | Backend         | AI/Database       |
|----------------|------------------|-------------------|
| React.js       | Node.js + Express | Together API      |
| CSS (custom)   | multer, axios     | MongoDB Atlas     |
| LocalStorage   | pdf-parse, mammoth| mongoose          |

---

## 🧪 How to Run Locally

1. **Clone the repository**

```bash
git clone https://github.com/your-username/Mik-AI.git
cd Mik-AI
Set up environment variables

Create .env files:

server/.env

env
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
TOGETHER_API_KEY=your_together_api_key
You can also check .env.example for guidance.

Install dependencies

bash
Copy code
cd server
npm install

cd ../client
npm install
Run both servers

In one terminal (backend):

bash
Copy code
cd server
npm start
In another terminal (frontend):

bash
Copy code
cd client
npm start
🌐 Deployment
Frontend hosted on Vercel

Backend hosted on Render

🔮 Future Improvements
 Display uploaded filenames more clearly in UI

 Add login and authentication (user-specific sessions)

 Show chat timestamps

 Animate bot responses character-by-character

 Add voice input support

 Add file preview for uploads

🙋‍♀️ Made by Shivangi Dubey

