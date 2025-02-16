# 🎟️ Event Management Platform

## 📌 Project Description

The **Event Management Platform** is a full-stack web application that allows users to create, manage, and view events. It features user authentication, event creation tools, real-time attendee updates. The app is designed to be **responsive**, **secure**, and **scalable**.

---

## 🌐 Live Demo

🔗 **Frontend:** https://event-management-platform-9qgy.onrender.com

🔗 **Backend:** https://event-management-von8.onrender.com

---

## 🚀 Features

### 🔹 **User Authentication**

- Secure login and registration using **JWT authentication**.

### 🔹 **Event Management**

- **Create and delete** events with details like title, description, date, and venue.
- View a list of **upcoming and past events** with filters.
- Only event creators can delete their own events.

### 🔹 **Real-Time Updates**

- **WebSockets (Socket.io)** for real-time attendee tracking.
- Users can see who is currently attending an event.

### 🔹 **Responsive Design**

- Fully mobile-friendly UI using **Tailwind CSS**.

---

## 🛠 **Tech Stack**

| Technology     | Description            |
| -------------- | ---------------------- |
| **Frontend**   | React.js, Tailwind CSS |
| **Backend**    | Node.js, Express.js    |
| **Database**   | MongoDB                |
| **Auth**       | JSON Web Tokens (JWT)  |
| **Real-Time**  | Socket.io              |
| **Deployment** | Render                 |

---

## 📂 **Project Structure**

```
event-management-platform/
├── client/  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.js
├── server/  # Node.js backend
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── utils/
│   ├── package.json
│   ├── README.md
│   └── indexjs
├── .gitignore
├── README.md
└── package.json
```

---

## 🎯 **API Endpoints**

### 🔑 **Authentication**

#### ✅ **User Sign-Up**

- **Endpoint:** `POST /user/signup`

#### ✅ **User Login**

- **Endpoint:** `POST /user/login`

### 📌 **Event Management** (Protected Routes - Requires Token)

#### ✅ **Create an Event**

- **Endpoint:** `POST /event/create`
- **Request Body:**
  ```json
  {
    "title": "Tech Conference 2025",
    "description": "An event about latest tech trends.",
    "date": "2025-06-15T14:00:00Z",
    "venue": "Sydney Convention Center"
  }
  ```

#### ✅ **Get All Events**

- **Endpoint:** `GET /event/allevents`

✅ Get Current User Events

- Endpoint: GET /event/myevents

✅ **Delete an Event**

- **Endpoint:** `DELETE /event/delete/:id`

#### ✅ **Join an Event (Real-Time Attendees)**

- **WebSocket Event:** `joinEvent`

---

## 🛠 **Setup Instructions**

### 🔹 **Backend Setup**

```bash
cd server
npm install
npm start
```

### 🔹 **Frontend Setup**

```bash
npm install
npm start
```

---

## 📢 **GitHub Repo**

🔗 **GitHub Repo:** https://github.com/novneetsingh/event-management-platform
