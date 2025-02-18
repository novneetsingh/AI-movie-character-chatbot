## 🎭 AI Movie Character Chatbot 🎮

A real-time AI-powered chatbot that lets users chat with iconic movie characters using **Retrieval-Augmented Generation (RAG)**, **vector search**, **SocketIO** for instant responses, along with **Redis caching** and **BullMQ task queues** for performance optimization.

---

## **GitHub Repo**

🔗 https://github.com/novneetsingh/AI-movie-character-chatbot

---

## 🌐 **Live Demo**

🔗 **Frontend:** https://ai-movie-chatbot.onrender.com

🔗 **Backend:** https://ai-movie-character-chatbot-hdvc.onrender.com

---

## 🚀 Features

### 🔹 **Movie Character Chatbot**

- Chat with famous movie characters in real-time.
- AI responses match character personalities and movie dialogues.

### 🔹 **Retrieval-Augmented Generation (RAG)**

- Uses **Pinecone** vector search to find relevant movie dialogues.
- Passes retrieved dialogues as context to **Google Gemini AI** for better accuracy.

### 🔹 **Performance Optimizations**

- **Redis caching** for fast responses.
- **BullMQ task queue** for efficient background processing.
- **Rate limiting** (5 requests/sec per user) to prevent abuse.

### 🔹 **Real-Time WebSockets**

- Uses **Socket.io** for seamless, instant chatbot interactions.

---

## 🛠 **Tech Stack**

| Technology      | Description         |
| --------------- | ------------------- |
| **Backend**     | Node.js, Express.js |
| **Database**    | MongoDB             |
| **Vector DB**   | Pinecone            |
| **Cache**       | Redis               |
| **Queue**       | BullMQ              |
| **AI Model**    | Google Gemini AI    |
| **Web Sockets** | Socket.io           |
| **Deployment**  | Render              |

---

## 💂️ **Project Structure**

```
ai-movie-character-chatbot/
├── server/
│   ├── controllers/
│   │   ├── chatController.js  # Handles chat requests
│   ├── config/
│   │   ├── redis.js           # Redis caching config
│   │   ├── bullmq.js          # Task queue setup
│   │   ├── pinecone.js        # Vector database setup
│   ├── utils/
│   │   ├── chatWorker.js      # BullMQ worker for AI responses
│   ├── routes/
│   │   ├── chatRoutes.js      # API routes
│   ├── index.js               # Server entry point
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main frontend component
├── .gitignore
├── README.md
└── package.json
```

---

## 🎯 **API Endpoints**

### 🔥 **Chatbot API**

#### ✅ **Send a Message (REST API)**

- **Endpoint:** `POST /chat`
- **Request Body:**
  ```json
  {
    "character": "iron man",
    "user_message": "What's your favorite suit?"
  }
  ```
- **Response:**
  ```json
  {
    "response": "My Mark 42 suit is one of my best creations!"
  }
  ```

#### ✅ **Send a Message (SocketIO)**

- **Event:** `chatbotMessage`
- **Request:**
  ```json
  {
    "character": "joker",
    "user_message": "Why so serious?"
  }
  ```
- **Response Event:** `chatbotResponse`
  ```json
  {
    "response": "Let's put a smile on that face!"
  }
  ```

---

## 🚀 **Setup Instructions**

### 🔹 **Backend Setup**

```bash
cd server
npm install
node index.js
```

### 🔹 **Frontend Setup**

```bash
npm install
npm start (to start both server and client)
```

---
