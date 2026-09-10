# PrepAI — AI-Powered Interview Preparation Platform

An AI-powered SaaS application for interview preparation featuring mock interviews, quizzes, resume building, and cover letter generation.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** Clerk
- **AI:** Google Gemini API

## Project Structure

```
PrepAI/
├── client/    # React frontend (Vite)
└── server/    # Express backend
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Clerk account
- Google Gemini API key

### Server Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run dev
```

### Client Setup

```bash
cd client
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run dev
```

## Environment Variables

See `.env.example` files in both `client/` and `server/` directories.

## License

MIT
