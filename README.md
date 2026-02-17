# Real-Time Polling Application

A fullstack real-time polling web application that allows users to create polls, share them via link, and see live vote results updated instantly across all viewers.



## ✨ Features

- ✅ Create polls with custom questions and 2-10 options
- ✅ Share polls via unique shareable links
- ✅ Real-time vote updates using Socket.io
- ✅ Single-choice voting with ability to change votes
- ✅ Anti-abuse mechanisms for fair voting
- ✅ Responsive UI with Tailwind CSS
- ✅ PostgreSQL database for data persistence
- ✅ TypeScript for type safety

## 🛡️ Anti-Abuse Mechanisms

### 1. Browser Fingerprint (localStorage UUID)

**What it does:**
- Generates a unique UUID for each browser/device on first visit
- Stores the fingerprint in localStorage
- Links each vote to this fingerprint in the database
- Prevents the same browser from casting multiple votes

**What it prevents:**
- Multiple votes from the same device/browser
- Simple spam voting by refreshing the page

**Limitations:**
- Can be bypassed by clearing browser data (localStorage)
- Can be bypassed using incognito/private browsing mode
- Different browsers on same device are treated as different users
- Not effective against determined attackers with technical knowledge

**Implementation:**
```typescript
// client/src/utils/fingerprint.ts
export const getFingerprint = (): string => {
  let fingerprint = localStorage.getItem('voter_fingerprint');
  if (!fingerprint) {
    fingerprint = crypto.randomUUID();
    localStorage.setItem('voter_fingerprint', fingerprint);
  }
  return fingerprint;
};
```

### 2. IP Address Tracking

**What it does:**
- Captures the voter's IP address from request headers
- Stores IP address with each vote in the database
- Checks if IP already voted on the poll before allowing new votes
- Uses `x-forwarded-for` header to get real IP behind proxies

**What it prevents:**
- Multiple votes from the same network/device
- Voting from multiple browser sessions on same device
- Basic automated voting scripts

**Limitations:**
- Users behind the same NAT/proxy (e.g., office network, public WiFi) share the same IP
  - Legitimate users on same network may be blocked from voting
  - Only one person in a household/office can vote
- Can be bypassed using VPN services or proxy servers
- Dynamic IPs may allow the same user to vote after IP change
- Privacy concerns with storing IP addresses

**Implementation:**
```typescript
// backend/middleware/ipTracker.ts
export const ipTracker = (req: Request, res: Response, next: NextFunction) => {
  const forwarded = req.headers['x-forwarded-for'];
  let ip: string;
  if (forwarded) {
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    ip = forwardedIp || 'unknown';
  } else {
    ip = req.socket.remoteAddress || 'unknown';
  }
  req.voterIp = ip.trim();
  next();
};
```

### Combined Protection

Both mechanisms work together:
- Database has unique constraint on `(pollId, voterFingerprint)`
- Backend checks BOTH IP and fingerprint before allowing votes
- If either IP OR fingerprint matches, the existing vote is updated (not created)
- This provides defense-in-depth while allowing users to change their votes

**Database Schema:**
```prisma
model Vote {
  id                Int      @id @default(autoincrement())
  pollId            String
  optionId          Int
  voterIp           String
  voterFingerprint  String
  
  @@unique([pollId, voterFingerprint])  // Prevents duplicate votes
  @@index([voterIp])  // Fast IP lookups
}
```

## 🔧 Edge Cases Handled

### 1. Poll Not Found (404)
- **Scenario:** User tries to access a poll with invalid/non-existent ID
- **Handling:** Display user-friendly 404 page with option to create new poll
- **Implementation:** API returns 404, frontend catches and shows error state

### 2. Concurrent Votes
- **Scenario:** Multiple users vote on the same option simultaneously
- **Handling:** Database transactions and unique constraints ensure consistency
- **Implementation:** Prisma handles concurrent writes with ACID guarantees

### 3. Changing Votes
- **Scenario:** User wants to change their vote after initial submission
- **Handling:** Uses UPSERT pattern - updates existing vote instead of creating new
- **Implementation:** 
  ```typescript
  const existingVote = await prisma.vote.findFirst({
    where: { pollId, OR: [{ voterIp }, { voterFingerprint }] }
  });
  if (existingVote) {
    vote = await prisma.vote.update({ where: { id: existingVote.id }, data: { optionId } });
  }
  ```

### 4. Network Failures
- **Scenario:** Vote submission fails due to network issues
- **Handling:** Error messages with retry buttons, error boundaries
- **Implementation:** Try-catch blocks, axios error handling, UI error states

### 5. Invalid Poll Data
- **Scenario:** Empty questions, <2 options, >10 options, empty option text
- **Handling:** Frontend and backend validation with clear error messages
- **Implementation:**
  ```typescript
  // Frontend validation
  if (!question.trim()) {
    errors.question = 'Question is required';
  }
  const validOptions = options.filter(opt => opt.trim().length > 0);
  if (validOptions.length < 2) {
    errors.options = 'At least 2 options are required';
  }
  
  // Backend validation
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'At least 2 options are required' });
  }
  ```

### 6. Real-Time Update Race Conditions
- **Scenario:** Vote submission completes before socket event received
- **Handling:** Optimistic UI updates + socket event deduplication
- **Implementation:** Update UI immediately on vote success, socket event confirms

### 7. Empty/Invalid Inputs
- **Scenario:** User tries to submit form with missing data
- **Handling:** Disable submit buttons until valid, show validation errors
- **Implementation:** Controlled form components with validation state

### 8. Socket Connection Failures
- **Scenario:** WebSocket connection fails or disconnects
- **Handling:** Auto-reconnection with exponential backoff, fallback to polling
- **Implementation:**
  ```typescript
  const socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  ```

### 9. Page Refresh During Voting
- **Scenario:** User refreshes page after voting
- **Handling:** Vote state persisted in localStorage, UI shows voted state
- **Implementation:** Store voted poll IDs and options in localStorage

### 10. Invalid Option ID in Vote
- **Scenario:** User submits vote with option ID that doesn't belong to poll
- **Handling:** Backend validates option exists in poll before accepting vote
- **Implementation:**
  ```typescript
  const optionExists = poll.options.some((opt) => opt.id === optionId);
  if (!optionExists) {
    return res.status(400).json({ error: 'Invalid option ID for this poll' });
  }
  ```

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Real-time:** Socket.io
- **Database:** PostgreSQL
- **ORM:** Prisma 7.4.0 (ESM-first with driver adapters)
- **ID Generation:** nanoid (short poll IDs)
- **CORS:** Configured for frontend origin

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **State Management:** React Hooks

## 📁 Project Structure

```
Real-Time/
├── backend/
│   ├── controller/
│   │   └── poll.controller.ts       # Business logic for polls
│   ├── lib/
│   │   └── prisma.ts                 # Prisma client instance
│   ├── middleware/
│   │   └── ipTracker.ts              # IP extraction middleware
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/               # Database migrations
│   ├── routes/
│   │   └── poll.routes.ts            # API route definitions
│   ├── index.ts                       # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Polling-App.postman_collection.json
│
└── client/
    ├── src/
    │   ├── components/                # Reusable UI components
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── ErrorMessage.tsx
    │   │   ├── PollForm.tsx
    │   │   └── PollOptionCard.tsx
    │   ├── pages/                     # Route pages
    │   │   ├── CreatePoll.tsx
    │   │   ├── PollView.tsx
    │   │   └── NotFound.tsx
    │   ├── hooks/                     # Custom React hooks
    │   │   └── useSocket.ts
    │   ├── utils/                     # Utility functions
    │   │   ├── api.ts                 # API client
    │   │   └── fingerprint.ts         # Browser fingerprinting
    │   ├── types/                     # TypeScript types
    │   │   └── poll.types.ts
    │   ├── App.tsx                    # Root component with routing
    │   ├── main.tsx                   # Entry point
    │   └── index.css                  # Global styles
    ├── package.json
    ├── vite.config.ts
    └── .env
```

## 🚀 Local Development Setup

### Prerequisites
- Node.js v20.19+ or v22.12+
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/poll_db?schema=public"
   PORT=5000
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_WS_URL=http://localhost:5000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

### Testing

1. Open `http://localhost:5173` in browser
2. Create a poll with question and options
3. Copy the generated share link
4. Open link in multiple browser tabs/windows
5. Vote from different tabs and watch real-time updates
6. Test changing vote (votes should update, not duplicate)
7. Clear localStorage and try voting again (should be prevented by IP)

## 📋 API Endpoints

### Health Check
```
GET /api/health
```

### Create Poll
```
POST /api/polls
Body: {
  "question": "string",
  "options": ["string", "string", ...]
}
Response: Poll object with id
```

### Get Poll
```
GET /api/polls/:pollId
Response: Poll with options and vote counts
```

### Submit Vote
```
POST /api/polls/:pollId/vote
Body: {
  "optionId": number,
  "voterFingerprint": "string"
}
Response: Vote result with updated poll data
```

## 🚢 Deployment (Render)

### Backend Deployment

1. **Create PostgreSQL database on Render**
   - Add PostgreSQL service
   - Copy internal database URL

2. **Create Web Service for backend**
   - Connect GitHub repository
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `node dist/index.js`
   - Environment Variables:
     - `DATABASE_URL`: (from Render PostgreSQL)
     - `FRONTEND_URL`: (deployed frontend URL)
     - `NODE_ENV`: `production`

### Frontend Deployment

1. **Create Static Site on Render**
   - Connect GitHub repository
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL`: (deployed backend URL)
     - `VITE_WS_URL`: (deployed backend URL)

2. **Add Rewrite Rules** (for SPA routing)
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

## 📝 Testing with Postman

Import the collection: `backend/Polling-App.postman_collection.json`

The collection includes:
- Health Check
- Create Poll (auto-saves poll ID)
- Get Poll
- Vote on Poll
- Vote with Different User
- Change Vote

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit Pull Request

## 📄 License

MIT License - feel free to use for learning or commercial projects

## 👤 Author

[Your Name]
- GitHub: [Your GitHub Profile]
- Email: [Your Email]

---

**Built with ❤️ using React, TypeScript, Express, Socket.io, and PostgreSQL**
