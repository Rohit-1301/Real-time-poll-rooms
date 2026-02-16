# Real-Time Poll Rooms - Submission Notes

## 📋 Assignment Completion Summary

This document addresses all required submission criteria for the Full-Stack Real-Time Poll Rooms assignment.

---

## ✅ Required Features Implementation

### 1. Poll Creation ✓
- Users can create polls with a question and 2+ options
- Shareable link is automatically generated after creation
- Optional time-limited polls with countdown timer

### 2. Join by Link ✓
- Anyone with the share link can view and vote
- Single-choice voting enforced
- No authentication required (anonymous voting supported)

### 3. Real-Time Results ✓
- **Technology**: Socket.io WebSocket connections
- **Implementation**: All viewers join a poll-specific room and receive instant updates when anyone votes
- **No refresh needed**: Vote counts and percentages update automatically across all connected clients

### 4. Fairness / Anti-Abuse ✓
See detailed section below

### 5. Persistence ✓
- **Database**: MongoDB with Mongoose ODM
- **Storage**: All polls and votes are permanently stored
- Share links remain valid indefinitely
- Refreshing the page maintains poll state

### 6. Deployment ✓
- **Frontend**: [ADD YOUR VERCEL URL HERE]
- **Backend**: [ADD YOUR RENDER/RAILWAY URL HERE]
- **Database**: MongoDB Atlas

---

## 🛡️ Anti-Abuse Mechanisms (Required: 2 Mechanisms)

### Mechanism 1: Browser Token Restriction

**What it does:**
- Each browser generates a unique UUID token on first visit
- Token is stored in browser's `localStorage`
- Backend validates that each token can only vote once per poll

**Implementation:**
```javascript
// Frontend: utils/voterToken.js
- Generates UUID v4 on first visit
- Persists in localStorage
- Sent with every vote request

// Backend: routes/votes.js (lines 77-87)
- Checks Vote collection for existing voterToken + pollId combination
- Rejects duplicate votes with error message
```

**What it prevents:**
- Multiple votes from the same browser/device
- Casual repeat voting attempts
- Users clicking vote button multiple times

**Limitations:**
- Users can clear `localStorage` to bypass (but IP restriction still applies)
- Different browsers on same device are treated as different voters
- Incognito/private browsing creates new tokens

---

### Mechanism 2: IP Address Hashing & Restriction

**What it does:**
- Server extracts client IP address from request headers
- IP is hashed using SHA-256 for privacy protection
- Hashed IP is checked against existing votes for the poll

**Implementation:**
```javascript
// Backend: utils/ipHash.js
- Extracts IP from req.ip, X-Forwarded-For, or X-Real-IP headers
- Hashes using crypto.createHash('sha256')
- Stores only the hash, never the raw IP

// Backend: routes/votes.js (lines 89-100)
- Checks Vote collection for existing voterIpHash + pollId combination
- Rejects duplicate votes from same IP
```

**What it prevents:**
- Multiple votes from the same network/IP address
- Users clearing localStorage and attempting to vote again
- Automated bot attacks from single IP

**Limitations:**
- Users behind NAT/corporate proxy share the same public IP (only 1 vote per network)
- VPN users can change IP to vote multiple times
- Mobile users switching between WiFi and cellular get different IPs

---

### Bonus Mechanism 3: Rate Limiting

**What it does:**
- Limits vote submission attempts per IP address
- Prevents rapid-fire voting attempts

**Implementation:**
```javascript
// Backend: middleware/rateLimiter.js
- Vote endpoint: 10 requests per minute per IP
- Poll creation: 20 polls per hour per IP
- General API: 100 requests per 15 minutes per IP
```

**What it prevents:**
- Automated bot attacks
- Denial of service attempts
- Spam poll creation

---

## 🔧 Edge Cases Handled

### 1. Invalid Poll ID
- **Scenario**: User navigates to `/poll/invalid-id-123`
- **Handling**: Shows friendly "Poll Not Found" error page with link to create new poll
- **Code**: `frontend/src/components/PollRoom.tsx` (lines 124-139)

### 2. Poll Not Found in Database
- **Scenario**: Poll ID format is valid but doesn't exist in database
- **Handling**: Returns 404 error with clear message
- **Code**: `backend/routes/polls.js`

### 3. Duplicate Vote Attempts
- **Scenario**: User tries to vote twice (same browser or same IP)
- **Handling**: 
  - Backend rejects with 400 error and clear message
  - Frontend disables vote buttons after voting
  - Shows toast notification: "You have already voted in this poll"
- **Code**: `backend/routes/votes.js` (lines 77-100), `frontend/src/components/PollRoom.tsx` (lines 97-99)

### 4. Invalid Option Index
- **Scenario**: Malicious user sends `optionIndex: 999` for a poll with 3 options
- **Handling**: Backend validates index is within bounds before processing
- **Code**: `backend/routes/votes.js` (lines 36-41)

### 5. Missing Required Fields
- **Scenario**: Vote request missing `pollId`, `optionIndex`, or `voterToken`
- **Handling**: Returns 400 error with descriptive message
- **Code**: `backend/routes/votes.js` (lines 19-24)

### 6. Network Failures
- **Scenario**: API request fails due to network issues
- **Handling**: 
  - Frontend catches errors and shows user-friendly toast notification
  - Socket.io automatically reconnects on disconnection
- **Code**: `frontend/src/components/PollRoom.tsx` (lines 94-100)

### 7. Concurrent Voting
- **Scenario**: Multiple users vote at the exact same time
- **Handling**: 
  - MongoDB atomic operations ensure vote counts are accurate
  - Compound indexes prevent race conditions in duplicate detection
- **Code**: `backend/models/Vote.js` (lines 38-41)

### 8. Socket Disconnections
- **Scenario**: User's WebSocket connection drops
- **Handling**: 
  - Socket.io client automatically attempts reconnection
  - Poll data is re-fetched on reconnection
  - Users can still vote via HTTP API even if socket is down
- **Code**: `frontend/src/utils/socket.js`

### 9. Empty or Whitespace-Only Options
- **Scenario**: User tries to create poll with empty option text
- **Handling**: Frontend validation prevents submission
- **Code**: `frontend/src/components/PollCreation.tsx`

### 10. Extremely Long Text
- **Scenario**: User enters very long question or option text
- **Handling**: 
  - Frontend enforces character limits
  - Backend validates maximum lengths
  - UI handles overflow with proper text wrapping

### 11. Time-Limited Poll Expiration
- **Scenario**: Poll has an `endsAt` timestamp that passes
- **Handling**:
  - Backend rejects votes after expiration (lines 43-49 in votes.js)
  - Frontend shows "Poll has ended" message
  - Results are revealed only after poll closes
  - Countdown timer shows remaining time
- **Code**: `backend/routes/votes.js` (lines 43-49), `frontend/src/components/CountdownTimer.tsx`

### 12. Proxy/Load Balancer IP Extraction
- **Scenario**: App is behind reverse proxy (Nginx, Vercel, etc.)
- **Handling**: Checks multiple headers (`X-Forwarded-For`, `X-Real-IP`, `req.ip`) to get real client IP
- **Code**: `backend/utils/ipHash.js`

---

## ⚠️ Known Limitations

### 1. WebSocket Support on Serverless Platforms
- **Issue**: Vercel and some serverless platforms don't fully support persistent WebSocket connections
- **Impact**: Real-time updates may not work if backend is deployed to Vercel
- **Solution**: Deploy backend to Render, Railway, or Heroku for full WebSocket support
- **Workaround**: Frontend falls back to HTTP polling if sockets fail

### 2. IP-Based Blocking for Shared Networks
- **Issue**: Users behind the same NAT, corporate proxy, or public WiFi share a public IP
- **Impact**: Only one person per network can vote
- **Examples**: 
  - Office building with 100 employees = 1 vote total
  - Coffee shop WiFi users = 1 vote total
  - Family members on home WiFi = 1 vote total
- **Trade-off**: This is intentional to prevent abuse, but may limit legitimate votes in shared network scenarios

### 3. LocalStorage Clearing Bypass
- **Issue**: Users can clear browser `localStorage` to remove their voter token
- **Impact**: Browser token restriction can be bypassed
- **Mitigation**: IP restriction still applies, so clearing localStorage alone won't allow re-voting
- **Why acceptable**: Requires both localStorage clearing AND IP change (VPN) to vote twice, which is a high barrier

### 4. VPN/Proxy Bypass
- **Issue**: Users with VPN can change IP address to bypass IP restriction
- **Impact**: Determined users can vote multiple times by switching VPN servers
- **Trade-off**: Implementing stronger authentication (phone numbers, email verification) would reduce anonymity and user friction
- **Acceptable for use case**: For casual polls, this level of protection is reasonable

### 5. No Vote Modification
- **Issue**: Once a vote is cast, it cannot be changed
- **Impact**: Users who accidentally click wrong option cannot fix their mistake
- **Reason**: Simplifies anti-abuse logic and prevents gaming the system
- **Future improvement**: Could add "change vote" feature with additional validation

### 6. No Poll Deletion
- **Issue**: Poll creators cannot delete their polls
- **Impact**: Polls remain accessible indefinitely
- **Reason**: No authentication system to verify poll ownership
- **Future improvement**: Add user accounts with poll ownership

### 7. Scalability Limits
- **Issue**: All votes are stored permanently without cleanup
- **Impact**: Database size grows indefinitely
- **Future improvement**: Implement poll expiration and archival system

### 8. No Results-Only View
- **Issue**: Cannot view results without the ability to vote
- **Impact**: Poll creators must vote to see results, or share link with voters
- **Future improvement**: Add separate results-only link or admin view

---

## 🧪 Testing Performed

### Manual Testing Checklist
- ✅ Create poll with 2 options
- ✅ Create poll with 10+ options
- ✅ Create time-limited poll
- ✅ Generate and copy shareable link
- ✅ Vote from multiple devices
- ✅ Verify real-time updates in multiple browser tabs
- ✅ Attempt duplicate vote (same browser) - correctly blocked
- ✅ Clear localStorage and attempt vote - correctly blocked by IP
- ✅ Test from different IP - vote allowed
- ✅ Test invalid poll ID - shows error page
- ✅ Test after poll expiration - voting blocked
- ✅ Test countdown timer accuracy
- ✅ Test dark mode toggle
- ✅ Test mobile responsive design
- ✅ Test socket disconnection/reconnection
- ✅ Test concurrent voting from 5+ users

---

## 🚀 Deployment Instructions

### Prerequisites
- MongoDB Atlas account (free tier)
- Vercel account (frontend)
- Render/Railway account (backend)

### Step 1: MongoDB Atlas Setup
1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Whitelist all IPs (0.0.0.0/0)
4. Copy connection string

### Step 2: Backend Deployment (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables:
   - `MONGODB_URI`: [your MongoDB Atlas connection string]
   - `FRONTEND_URL`: [will add after frontend deployment]
   - `NODE_ENV`: `production`
8. Deploy and copy URL

### Step 3: Frontend Deployment (Vercel)
1. Import GitHub repository to Vercel
2. Set root directory: `frontend`
3. Framework preset: Vite
4. Add environment variables:
   - `VITE_API_URL`: [your Render backend URL]
   - `VITE_SOCKET_URL`: [your Render backend URL]
5. Deploy

### Step 4: Update Backend
1. Go back to Render
2. Update `FRONTEND_URL` environment variable with Vercel URL
3. Redeploy backend

---

## 📊 Technology Stack Summary

**Frontend:**
- React 19 with TypeScript
- Vite (build tool)
- Tailwind CSS 4
- Socket.io Client
- React Router
- Axios

**Backend:**
- Node.js + Express 5
- Socket.io Server
- MongoDB + Mongoose
- Helmet (security headers)
- Express Rate Limit
- bcryptjs (IP hashing)

**Deployment:**
- Frontend: Vercel
- Backend: Render/Railway
- Database: MongoDB Atlas

---

## 📝 Future Improvements

1. **User Authentication**: Optional accounts for poll creators to manage their polls
2. **Poll Analytics**: View count, vote timestamps, geographic distribution
3. **Poll Expiration**: Automatic archival of old polls
4. **Results Export**: Download results as CSV/PDF
5. **Multiple Choice**: Allow selecting multiple options
6. **Ranked Choice Voting**: Preference-based voting system
7. **Custom Themes**: Let creators customize poll appearance
8. **Email Notifications**: Alert creators when votes are cast
9. **Poll Categories**: Organize polls by topic/category
10. **Vote Modification**: Allow users to change their vote within a time window

---

## 👨‍💻 Developer Notes

- **Code Quality**: ESLint configured for both frontend and backend
- **Type Safety**: TypeScript used in frontend for better DX
- **Error Handling**: Centralized error handling middleware
- **Security**: Helmet.js, CORS, rate limiting, IP hashing
- **Performance**: Database indexes on frequently queried fields
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Responsive**: Mobile-first design approach

---

## 📞 Support

For questions or issues, please refer to the main README.md or create an issue in the GitHub repository.

---

**Submission Date**: February 2026  
**Built with**: MERN Stack + Socket.io  
**License**: MIT
