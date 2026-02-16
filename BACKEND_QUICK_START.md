# MERN Chat Backend Setup (Quick Start)

Your frontend is ready and running on http://localhost:5173. Here's a quick backend setup to get the full chat app working.

## Quick Express + Socket.IO Backend Template

### 1. Initialize Backend Project

```bash
cd backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express cors mongoose socket.io bcryptjs jsonwebtoken dotenv
npm install --save-dev nodemon
```

### 3. Create `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-chat
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

### 4. Create `server.js`

```javascript
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: { origin: 'http://localhost:5173', credentials: true }
})

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Mock user data (replace with DB)
const users = new Map()
const chats = new Map()
const messages = new Map()

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body
  if (users.has(email)) {
    return res.status(400).json({ message: 'User already exists' })
  }
  const user = { _id: Date.now(), name, email, password, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` }
  users.set(email, user)
  res.json({ token: 'fake-token-' + user._id, user })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = users.get(email)
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  res.json({ token: 'fake-token-' + user._id, user })
})

app.get('/api/auth/me', (req, res) => {
  res.json({ user: { _id: '123', name: 'Test User', email: 'test@example.com' } })
})

// Chat Routes
app.get('/api/chats', (req, res) => {
  res.json(Array.from(chats.values()))
})

app.post('/api/chats', (req, res) => {
  const chat = { _id: Date.now(), name: 'Chat', members: [], lastMessage: '' }
  chats.set(chat._id, chat)
  res.json(chat)
})

// Message Routes
app.get('/api/messages/:chatId', (req, res) => {
  const msgs = messages.get(req.params.chatId) || []
  res.json(msgs)
})

app.post('/api/messages', (req, res) => {
  const { chatId, text } = req.body
  const msg = {
    _id: Date.now(),
    chatId,
    text,
    sender: 'user-123',
    senderName: 'You',
    createdAt: new Date(),
    seen: false,
  }
  if (!messages.has(chatId)) {
    messages.set(chatId, [])
  }
  messages.get(chatId).push(msg)
  res.json(msg)
})

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('chat:join', (data) => {
    socket.join(data.chatId)
    console.log('User joined chat:', data.chatId)
  })

  socket.on('message:send', (data) => {
    console.log('Message:', data.message)
    io.to(data.chatId).emit('message:received', data.message)
  })

  socket.on('user:typing', (data) => {
    socket.to(data.chatId).emit('user:typing', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

### 5. Update `package.json` scripts

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

### 6. Run Backend

```bash
npm run dev
```

Server should start on http://localhost:5000

## Testing the Full App

1. **Backend running**: `npm run dev` in `/backend` → http://localhost:5000
2. **Frontend running**: `npm run dev` in `/frontend` → http://localhost:5173
3. Open http://localhost:5173 in browser
4. Register/login (mock auth works with any email/password)
5. See mock chats and send messages in real-time via Socket.IO

## Next Steps for Production

- Replace mock data with MongoDB models
- Add real JWT authentication
- Implement proper error handling
- Add input validation
- Set up environment-specific configs
- Deploy frontend to Vercel/Netlify
- Deploy backend to Heroku/Railway/AWS

## Architecture Notes

- Frontend: React + Vite + React Router + Axios + Socket.IO
- Backend: Express + Socket.IO + CORS enabled
- Auth: Simple JWT (use httpOnly cookies in production)
- Real-time: Socket.IO for instant messaging
- Design: Integrated design-system with design tokens

---

**Frontend Status**: ✅ Complete (Phases 0-5)
**Backend Status**: 📋 Minimal template provided above
**Next**: Build full backend with MongoDB + validation
