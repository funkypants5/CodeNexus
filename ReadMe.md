# CodeNexus - StackOverflow Clone

This project is a StackOverflow-like forum application, where users can create accounts, post discussions, reply, like/dislike posts, and upload profile pictures.

Built with:

- ReactJS (Vite) for the frontend
- ExpressJS for the backend
- MongoDB for the database
- Multer for file uploads

---

## Prerequisites

Ensure the following are installed on your local development environment:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (installed and running locally)

---

## Database Structure

MongoDB contains three collections:

**Users Collection**:

- `_id`
- `email`
- `username`
- `password`
- `profile picture`

**Forums Collection**:

- `_id`
- `title`
- `discussionBody`
- `tags`
- `author`
- `createdAt`
- `createdBy`
- `likes`
- `dislikes`
- `likedBy`
- `dislikedBy`

**Replies Collection**:

- `_id`
- `userId`
- `username`
- `replyText`
- `createdAt`
- `likes`
- `dislikes`
- `likedBy`
- `dislikedBy`

---

## Backend Setup (ExpressJS)

In your first terminal:

1. Navigate to the backend directory:

```bash
cd Backend
```

2. Install dependencies:

```bash
npm install
```

3. Navigate to the CRM folder inside Backend:

```bash
cd crm
```

4. Install dependencies again:

```bash
npm install
```

5. Start the backend server:

```bash
npm run server
```

The backend server will run at `http://localhost:5000` (or the configured port).

---

## Frontend Setup (ReactJS + Vite)

In your second terminal:

1. Navigate to the frontend directory:

```bash
cd Frontend
```

2. Navigate to the SCRM folder inside Frontend:

```bash
cd scrm
```

3. Install dependencies:

```bash
npm install
```

4. Start the frontend server:

```bash
npm run dev
```

The frontend will be available by default at:  
http://localhost:5173

---

## Important Notes

- **MongoDB** must be installed and running locally for the app to function properly.
- You must use **two terminals** — one for the backend, one for the frontend.
- **Multer** is used for handling user profile image uploads in the backend.

---

## Project Done By

**Zackeus Choo Kai Jie**
