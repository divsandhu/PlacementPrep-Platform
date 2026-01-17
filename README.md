# PlacementPrep – Real-Time Placement Preparation Platform

**PlacementPrep** is a real-time quiz platform built for **placement preparation and collaborative practice**. Users can create or join rooms, attempt synchronized quizzes with friends, and view live leaderboards—making preparation competitive, timed, and engaging.

---

## 🚀 Features

- ✅ **Room Creation & Joining** – Create or join quiz rooms using unique room IDs  
- ✅ **Real-time Quiz Sessions** – All participants receive the same questions simultaneously  
- ✅ **Placement-Oriented Content** – Questions focused on Aptitude, DSA, OS, DBMS, CN, and CS fundamentals  
- ✅ **Live Leaderboard** – Real-time score updates and rankings  
- ✅ **Timer-Based Questions** – Time-bound quizzes to simulate actual placement tests  
- ✅ **Responsive UI** – Clean, modern, mobile-friendly interface built with Tailwind CSS  

---

## 🛠 Tech Stack

### Frontend
- React 19  
- Socket.io Client  
- Tailwind CSS  
- React Router DOM  
- Axios  

### Backend
- Node.js  
- Express.js  
- Socket.io  
- CORS  

## Project Structure

```
websocket/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx   # Landing page (create/join room)
│   │   │   └── Room.jsx   # Quiz room interface
│   │   ├── services/
│   │   │   └── quizService.js  # Client-side quiz logic
│   │   ├── App.jsx        # Main app with routing
│   │   └── socket.js      # Socket.io client setup
│   └── package.json
├── server/                # Express backend
│   ├── data/
│   │   └── quizData.js    # Quiz questions and data
│   ├── managers/
│   │   └── roomManager.js # Room management logic
│   ├── routes/
│   │   └── rooms.js       # Room management API
│   ├── socketHandlers/
│   │   └── index.js       # Socket event handlers
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Running

1. **Install dependencies for both client and server:**

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Start the server:**
```bash
cd server
npm start
```
The server will run on `http://localhost:5000`

3. **Start the client (in a new terminal):**
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

4. **Open your browser and navigate to `http://localhost:5173`**

## How to Use

1. **Create a Room:**
   - Enter your username
   - Select quiz difficulty (Easy/Medium/Hard)
   - Click "Create Room"
   - Share the generated Room ID with others

2. **Join a Room:**
   - Enter your username
   - Enter the Room ID
   - Click "Join Room"

3. **Participate in Quiz:**
   - Host starts the quiz when everyone is ready
   - Answer questions within the time limit
   - See real-time leaderboard updates
   - View final results when quiz ends

## API Endpoints

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomId` - Get room information
- `GET /api/rooms/quizzes/:difficulty` - Get quiz questions
- `DELETE /api/rooms/:roomId` - Delete a room

## Socket Events

### Client → Server
- `join-room` - Join a room
- `start-quiz` - Start quiz (host only)
- `submit-answer` - Submit quiz answer

### Server → Client
- `user-joined` - User joined the room
- `user-left` - User left the room
- `room-state` - Current room state
- `quiz-started` - Quiz has started
- `next-question` - Next question available
- `quiz-finished` - Quiz completed
- `update-leaderboard` - Leaderboard updated
- `answer-submitted` - Answer submitted by user



## Development Notes

- **Modular Architecture**: The application is now organized into separate modules:
  - `quizData.js`: Centralized quiz questions and configurations
  - `roomManager.js`: Room operations and state management
  - `quizService.js`: Client-side quiz logic and API calls
- **In-memory Storage**: Uses in-memory storage for rooms and scores
- **For Production**: Consider using a database (MongoDB, PostgreSQL)
- **Real-time Communication**: Socket.io handles real-time communication between clients
- **Responsive UI**: Works on mobile devices with Tailwind CSS
- **Error Handling**: Comprehensive error handling for network issues and invalid room IDs
- **Scalable Design**: Easy to extend with new quiz categories and features


