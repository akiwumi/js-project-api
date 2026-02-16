const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIO = require('socket.io')
const mongoose = require('mongoose')
const listEndpoints = require('express-list-endpoints')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:60028', 'http://127.0.0.1:5173']

const io = socketIO(server, {
  cors: { origin: allowedOrigins, credentials: true }
})

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-chat')
  .then(() => {
    console.log('✅ Connected to MongoDB successfully')
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

// MongoDB Models
const User = require('./models/User')
const Chat = require('./models/Chat')
const Message = require('./models/Message')

// Mock data storage (keeping for backward compatibility during transition)
const testUsers = {
  'test@example.com': {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  'alice@example.com': {
    _id: '507f1f77bcf86cd799439012',
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=10',
  },
  'bob@example.com': {
    _id: '507f1f77bcf86cd799439013',
    name: 'Bob',
    email: 'bob@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=20',
  },
}

// In-memory storage for tokens (keep for now)
const tokens = new Map()

// Seed database with test data
async function seedDatabase() {
  try {
    // Check if test users already exist
    const existingUsers = await User.find({ email: { $in: Object.keys(testUsers) } })
    
    if (existingUsers.length === 0) {
      // Create test users
      const users = await User.create(Object.values(testUsers))
      console.log('✅ Created test users in MongoDB')
      
      // Create test chat between first two users
      const testChat = await Chat.create({
        name: 'Test Chat',
        members: [users[0]._id, users[1]._id],
        lastMessage: 'Hello! This is a test message.',
      })
      
      // Create test messages
      await Message.create([
        {
          chatId: testChat._id,
          text: 'Hey! Welcome to the chat app 👋',
          sender: users[1]._id,
          senderName: users[1].name,
          seen: true,
          createdAt: new Date(Date.now() - 300000),
        },
        {
          chatId: testChat._id,
          text: 'Thanks! Excited to test this out',
          sender: users[0]._id,
          senderName: users[0].name,
          seen: true,
          createdAt: new Date(Date.now() - 240000),
        },
        {
          chatId: testChat._id,
          text: 'Messages are real-time with Socket.IO ⚡',
          sender: users[1]._id,
          senderName: users[1].name,
          seen: false,
          createdAt: new Date(Date.now() - 180000),
        },
      ])
      
      console.log('✅ Created test chat and messages in MongoDB')
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// Seed database after connection
mongoose.connection.once('open', () => {
  seedDatabase()
})

// ===== ROUTES =====

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Create new user
    const newUser = await User.create({ name, email, password })
    const token = 'token_' + newUser._id
    tokens.set(token, newUser)

    res.json({
      token,
      user: newUser,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    // Find user in database or fall back to test users
    let user = await User.findOne({ email })
    if (!user && testUsers[email]) {
      user = testUsers[email]
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = 'token_' + user._id
    tokens.set(token, user)

    res.json({
      token,
      user: user,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' })
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    let user = tokens.get(token)

    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // If user is from test data, try to find in database
    if (user.email && testUsers[user.email]) {
      const dbUser = await User.findOne({ email: user.email })
      if (dbUser) {
        user = dbUser
      }
    }

    res.json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Chat Routes
app.get('/api/chats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const user = tokens.get(token)
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // Find chats where user is a member
    const chats = await Chat.find({ members: user._id })
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 })

    res.json(chats)
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/chats', async (req, res) => {
  try {
    const { userId } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    const user = tokens.get(token)
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId required' })
    }

    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      members: { $all: [user._id, userId], $size: 2 }
    })

    if (existingChat) {
      return res.json(existingChat)
    }

    // Create new chat
    const newChat = await Chat.create({
      name: 'New Chat',
      members: [user._id, userId],
    })

    const populatedChat = await Chat.findById(newChat._id)
      .populate('members', 'name email avatar')

    res.json(populatedChat)
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Message Routes
app.get('/api/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params
    const token = req.headers.authorization?.split(' ')[1]
    const user = tokens.get(token)
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // Verify user is a member of this chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      members: user._id 
    })

    if (!chat) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Get messages for this chat
    const messages = await Message.find({ chatId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/messages', async (req, res) => {
  try {
    const { chatId, text } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    const user = tokens.get(token)

    if (!chatId || !text) {
      return res.status(400).json({ message: 'chatId and text required' })
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // Verify user is a member of this chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      members: user._id 
    })

    if (!chat) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Create new message
    const message = await Message.create({
      chatId,
      text,
      sender: user._id,
      senderName: user.name,
    })

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      lastMessageAt: new Date(),
    })

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')

    // Emit to all clients in this chat
    io.to(chatId).emit('message:received', populatedMessage)

    res.json(populatedMessage)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// API Documentation endpoint
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  const documentation = {
    title: 'MERN Chat API Documentation',
    version: '1.0.0',
    description: 'RESTful API for real-time chat application with Socket.IO',
    baseUrl: `http://localhost:${process.env.PORT || 3001}`,
    endpoints: endpoints.map(endpoint => ({
      path: endpoint.path,
      methods: endpoint.methods,
      description: getEndpointDescription(endpoint.path)
    })),
    examples: {
      auth: {
        login: {
          method: 'POST',
          path: '/api/auth/login',
          body: { email: 'test@example.com', password: 'password123' },
          description: 'Authenticate user and receive token'
        },
        register: {
          method: 'POST', 
          path: '/api/auth/register',
          body: { name: 'John Doe', email: 'john@example.com', password: 'password123' },
          description: 'Register new user account'
        }
      },
      chats: {
        getAll: {
          method: 'GET',
          path: '/api/chats',
          description: 'Get all chats for authenticated user'
        },
        create: {
          method: 'POST',
          path: '/api/chats',
          body: { userId: '507f1f77bcf86cd799439012' },
          description: 'Create new chat with user'
        }
      },
      messages: {
        getByChat: {
          method: 'GET',
          path: '/api/messages/:chatId',
          description: 'Get all messages for a specific chat'
        },
        create: {
          method: 'POST',
          path: '/api/messages',
          body: { chatId: '607f1f77bcf86cd799439101', text: 'Hello!' },
          description: 'Send new message (emits real-time via Socket.IO)'
        }
      }
    },
    socketEvents: {
      'chat:join': 'Join a chat room',
      'message:send': 'Send a message (real-time)',
      'message:received': 'Receive a message (real-time)',
      'user:typing': 'User is typing indicator',
      'user:stopped-typing': 'User stopped typing indicator'
    },
    testCredentials: {
      users: [
        { email: 'test@example.com', password: 'password123' },
        { email: 'alice@example.com', password: 'password123' },
        { email: 'bob@example.com', password: 'password123' }
      ]
    }
  }
  res.json(documentation)
})

// Helper function to provide endpoint descriptions
function getEndpointDescription(path) {
  const descriptions = {
    '/api/auth/register': 'Register a new user account',
    '/api/auth/login': 'Authenticate user and return JWT token',
    '/api/auth/logout': 'Logout user (clear session)',
    '/api/auth/me': 'Get current authenticated user profile',
    '/api/chats': 'Get all chats for authenticated user (collection)',
    '/api/chats': 'Create a new chat',
    '/api/messages/:chatId': 'Get messages for specific chat (single result)',
    '/api/messages': 'Send a new message (real-time via Socket.IO)'
  }
  return descriptions[path] || 'No description available'
}

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
  console.log('✓ User connected:', socket.id)

  socket.on('chat:join', (data) => {
    socket.join(data.chatId)
    console.log(`  └─ Joined chat: ${data.chatId}`)
  })

  socket.on('message:send', (data) => {
    io.to(data.chatId).emit('message:received', data.message)
  })

  socket.on('user:typing', (data) => {
    socket.to(data.chatId).emit('user:typing', data)
  })

  socket.on('user:stopped-typing', (data) => {
    socket.to(data.chatId).emit('user:stopped-typing', data)
  })

  socket.on('disconnect', () => {
    console.log('✗ User disconnected:', socket.id)
  })
})

// ===== START SERVER =====
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  MERN Chat Backend — Test Server 🚀   ║
╠════════════════════════════════════════╣
║  Server running on port ${PORT}           ║
║  CORS enabled for http://localhost:5173║
╠════════════════════════════════════════╣
║  TEST CREDENTIALS:                     ║
║  ─────────────────────────────────────║
║  Email:    test@example.com            ║
║  Password: password123                 ║
║                                        ║
║  Also available:                       ║
║  • alice@example.com / password123     ║
║  • bob@example.com / password123       ║
╠════════════════════════════════════════╣
║  API: http://localhost:${PORT}/api        ║
║  Socket.IO: ws://localhost:${PORT}        ║
╚════════════════════════════════════════╝
`)
})

module.exports = server
