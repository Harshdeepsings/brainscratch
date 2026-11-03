# Brainscratch

Brainscratch is a full-stack content-sharing platform that allows users to create, organize, and share useful content in one place. Users can publish their thoughts and attach external content such as YouTube videos and X/Twitter posts, making it easier to collect and access useful resources.

## 🚀 Features

- User registration and authentication
- Secure password hashing with bcrypt
- JWT-based authentication
- Create and share content
- YouTube and X/Twitter content embedding
- Shareable content links
- Responsive frontend
- Dark mode support
- Input validation using Zod

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod

## 📁 Project Structure

```text
Brainscratch/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.ts
│   ├── package.json
│   └── ...
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   └── ...
    ├── package.json
    └── ...