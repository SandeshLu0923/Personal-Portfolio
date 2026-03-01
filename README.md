# Personal Portfolio (MERN Stack)

This is a full-stack personal portfolio project built with the **MERN stack**:
- **MongoDB** for data storage
- **Express + Node.js** for backend APIs
- **React (Vite)** for frontend UI

## Features Implemented

- Home, About, Projects, and Contact sections
- Smooth scrolling navigation
- Active navigation highlight by current section
- Responsive layout for desktop/tablet/mobile
- Projects gallery with hover effects
- Project details modal popup
- Contact form with JavaScript validation
- Contact form backend API and MongoDB storage
- Resume open/download button (`client/public/Resume.pdf`)
- Seed script for project data

## Project Structure

```text
Personal-portfolio/
  client/   # React frontend
  server/   # Express/Mongo backend
```

## 1. Setup Backend

```bash
cd server
npm install
```

Create `.env` in `server/` using `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/portfolio_db
CLIENT_URL=http://localhost:5173
ALLOW_VERCEL_PREVIEWS=false
```

Optional: seed sample projects

```bash
npm run seed
```

Run backend:

```bash
npm run dev
```

## 2. Setup Frontend

In a new terminal:

```bash
cd client
npm install
```

Create `.env` in `client/` using `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

Open the shown Vite URL (typically `http://localhost:5173`).

## Navigation Guide

- `Home`: intro, profile image, resume links
- `About`: education, experience, hobbies
- `Projects`: gallery cards (click for modal details)
- `Contact`: validated form submission to backend

## Customize for Your Profile

- Replace `Your Name` and biography in `client/src/App.jsx`
- Update project links/images in MongoDB seed (`server/src/seed/projectsData.js`) or directly in DB
- Replace `client/public/Resume.pdf` with your actual resume
- Update profile image URL in `client/src/App.jsx`

## API Endpoints

- `GET /api/health`
- `GET /api/projects`
- `POST /api/contact`

## Deployment (Recommended)

### Backend (Render)

1. Create a new **Web Service** from the `server` directory.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables:
   - `PORT=5000`
   - `MONGO_URI=<your mongodb uri>`
   - `CLIENT_URL=<your deployed frontend url>`

### Frontend (Vercel or Netlify)

1. Deploy from the `client` directory.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable:
   - `VITE_API_BASE_URL=<your deployed backend url>`

### Important

- After first backend deploy, seed project data once:
  - `cd server`
  - `npm run seed`
- `projectUrl` in `server/src/seed/projectsData.js` is currently empty. Add live links so the **Live Demo** button appears in the modal.

## Submission

You can submit:
- source code (this repository), and/or
- deployed frontend + backend links.

If deploying, set environment variables for production URLs and MongoDB connection.

