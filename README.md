# Real-Time Poll Rooms 🗳️

A production-ready, full-stack MERN application for creating and sharing real-time polls with live vote updates. Built with modern web technologies and deployed to the cloud.

![Tech Stack](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌐 Live Demo

**🚀 Deployed Application**: [ADD YOUR DEPLOYED URL HERE]

> **📋 For Assignment Reviewers**: See [SUBMISSION.md](./SUBMISSION.md) for detailed notes on anti-abuse mechanisms, edge cases handled, and known limitations.

## ✨ Features

- **📊 Create Polls**: Easy-to-use interface for creating polls with multiple options
- **🔗 Shareable Links**: Generate unique URLs for each poll with one-click copy
- **⚡ Real-Time Updates**: Live vote counts using Socket.io - no refresh needed
- **🛡️ Anti-Abuse Protection**: Dual-layer voting restrictions (IP + Browser Token)
- **💾 Persistent Storage**: All polls and votes stored in MongoDB
- **🌓 Dark Mode**: Beautiful UI with light/dark theme toggle
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🚀 Production Ready**: Fully deployed and accessible online

## 🎯 Tech Stack

### Frontend
- **React** (TypeScript) - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling with custom animations
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.io** - WebSocket server
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

### Deployment
- **Frontend**: Vercel
- **Backend**: Render / Railway
- **Database**: MongoDB Atlas

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas account)
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-poll-rooms
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your MongoDB connection string
   # MONGODB_URI=mongodb://localhost:27017/poll-rooms
   # or use MongoDB Atlas connection string
   
   # Start backend server
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Start frontend dev server
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
real-time-poll-rooms/
├── backend/
│   ├── models/
│   │   ├── Poll.js          # Poll schema
│   │   └── Vote.js          # Vote schema with anti-abuse tracking
│   ├── routes/
│   │   ├── polls.js         # Poll creation and retrieval
│   │   └── votes.js         # Vote submission with validation
│   ├── middleware/
│   │   ├── errorHandler.js  # Centralized error handling
│   │   └── rateLimiter.js   # Rate limiting configuration
│   ├── utils/
│   │   └── ipHash.js        # IP hashing for privacy
│   ├── server.js            # Main server file
│   ├── package.json
│   ├── .env.example
│   └── vercel.json          # Deployment config
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PollCreation.tsx   # Poll creation form
│   │   │   ├── PollRoom.tsx       # Poll display and voting
│   │   │   ├── VoteOption.tsx     # Individual vote option
│   │   │   └── Toast.tsx          # Notification component
│   │   ├── utils/
│   │   │   ├── socket.js          # Socket.io client
│   │   │   └── voterToken.js      # Token management
│   │   ├── App.tsx                # Main app with routing
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Tailwind styles
│   ├── package.json
│   ├── .env.example
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── vercel.json          # Deployment config
│
└── README.md
```

## 🔒 Anti-Abuse Mechanisms

This application implements **two layers of protection** to ensure fair voting:

### 1. Browser Token Restriction
- Each browser generates a unique UUID token on first visit
- Token is stored in `localStorage`
- Backend checks if token has already voted in a poll
- **Prevents**: Multiple votes from the same browser

### 2. IP Address Restriction
- Server extracts client IP address (handles proxies/load balancers)
- IP is hashed using SHA-256 for privacy
- Hashed IP is stored with each vote
- Backend checks if IP has already voted in a poll
- **Prevents**: Multiple votes from the same network

### How It Works
When a user attempts to vote:
1. Frontend sends vote with browser token
2. Backend extracts and hashes IP address
3. System checks both token and IP against existing votes
4. If either has voted before → Vote rejected with message
5. If both are new → Vote accepted and poll updated
6. Real-time update sent to all connected clients

## 🌐 Deployment

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user with password
4. Whitelist IP addresses (or use `0.0.0.0/0` for all IPs)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/poll-rooms?retryWrites=true&w=majority
   ```

### Backend Deployment (Render)

1. Create account at [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `poll-rooms-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     MONGODB_URI=<your-mongodb-atlas-connection-string>
     FRONTEND_URL=<your-vercel-frontend-url>
     NODE_ENV=production
     ```
5. Click "Create Web Service"
6. Copy the deployed URL (e.g., `https://poll-rooms-backend.onrender.com`)

### Frontend Deployment (Vercel)

1. Create account at [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     ```
     VITE_API_URL=<your-render-backend-url>
     VITE_SOCKET_URL=<your-render-backend-url>
     ```
5. Click "Deploy"
6. Your app will be live at `https://your-app.vercel.app`

### Post-Deployment

1. Update backend `FRONTEND_URL` environment variable with Vercel URL
2. Test the full flow:
   - Create a poll
   - Share the link
   - Vote from multiple devices
   - Verify real-time updates work

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Poll Creation**
  - Create poll with 2 options ✓
  - Create poll with 5+ options ✓
  - Try submitting empty form (should show error) ✓
  - Try submitting with only 1 option (should show error) ✓

- [ ] **Voting**
  - Cast a vote ✓
  - Verify vote button disables after voting ✓
  - Verify percentage bars update ✓
  - Verify total vote count increases ✓

- [ ] **Real-Time Updates**
  - Open poll in two browser tabs ✓
  - Vote in one tab ✓
  - Verify other tab updates instantly ✓

- [ ] **Anti-Abuse**
  - Try voting twice in same browser (should be blocked) ✓
  - Clear localStorage and try voting again (should be blocked by IP) ✓
  - Test from different device (should allow vote) ✓

- [ ] **Edge Cases**
  - Navigate to invalid poll ID (should show error) ✓
  - Test with very long question text ✓
  - Test concurrent voting from multiple users ✓

- [ ] **UI/UX**
  - Test dark mode toggle ✓
  - Test on mobile viewport ✓
  - Copy shareable link ✓
  - Verify toast notifications appear ✓

## 📊 API Endpoints

### Polls

**Create Poll**
```http
POST /api/polls
Content-Type: application/json

{
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green"]
}
```

**Get Poll**
```http
GET /api/polls/:id
```

### Votes

**Submit Vote**
```http
POST /api/votes
Content-Type: application/json

{
  "pollId": "507f1f77bcf86cd799439011",
  "optionIndex": 0,
  "voterToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 🎨 UI Features

- **Gradient Backgrounds**: Beautiful purple-pink-red gradients
- **Animated Percentage Bars**: Smooth transitions on vote updates
- **Dark Mode**: Persistent theme preference
- **Toast Notifications**: Success/error feedback
- **Loading States**: Skeleton screens and spinners
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Semantic HTML and ARIA labels

## 🛠️ Edge Cases Handled

1. **Invalid Poll ID**: Shows friendly error message
2. **Poll Not Found**: Redirects to create new poll
3. **Duplicate Vote Attempts**: Clear error message
4. **Network Failures**: Error handling with retry options
5. **Extremely Long Text**: Character limits enforced
6. **Concurrent Voting**: Atomic database operations
7. **Empty Options**: Filtered out during validation
8. **Socket Disconnections**: Automatic reconnection

## 🔮 Future Improvements

- [ ] Poll expiration dates
- [ ] Results-only view (no voting)
- [ ] Poll categories and tags
- [ ] User accounts and poll history
- [ ] Export results as CSV/PDF
- [ ] Custom poll themes
- [ ] Multiple choice voting
- [ ] Ranked choice voting
- [ ] Poll analytics dashboard
- [ ] Email notifications for poll creators

## 🐛 Known Limitations

1. **Socket.io on Serverless**: Some serverless platforms (like Vercel) don't fully support WebSockets. For production, use Render or Railway for backend.
2. **IP-based Blocking**: Users behind the same NAT/proxy share an IP, so only one vote per network is allowed.
3. **LocalStorage Clearing**: Users can clear localStorage to bypass browser token restriction (but IP restriction still applies).

## 📝 License

MIT License - feel free to use this project for learning or production!

## 👨‍💻 Author

Built with ❤️ as a production-ready MERN stack demonstration

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Tailwind CSS for beautiful styling
- MongoDB Atlas for cloud database
- Vercel and Render for hosting

---

## 📋 Submission Information

For complete submission documentation including:
- **Anti-abuse mechanisms** (detailed explanation)
- **Edge cases handled** (comprehensive list)
- **Known limitations** (with trade-offs explained)
- **Deployment instructions** (step-by-step guide)

Please see **[SUBMISSION.md](./SUBMISSION.md)**

---

**Questions?** Open an issue or contact the maintainer.

