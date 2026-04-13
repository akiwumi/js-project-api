const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIO = require('socket.io')
const { randomUUID } = require('crypto')
const mongoose = require('mongoose')
const listEndpoints = require('express-list-endpoints')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:60028', 'http://127.0.0.1:5173']
const allowMemoryFallback = process.env.NODE_ENV !== 'production' || process.env.ALLOW_MEMORY_FALLBACK === 'true'

function parseConfiguredOrigins(value) {
  return (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const allowedOrigins = Array.from(new Set([
  ...defaultAllowedOrigins,
  ...parseConfiguredOrigins(process.env.CLIENT_URLS),
  ...parseConfiguredOrigins(process.env.CLIENT_URL),
]))

function corsOriginValidator(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true)
    return
  }

  callback(new Error(`Origin ${origin} not allowed by CORS`))
}

const io = socketIO(server, {
  cors: { origin: allowedOrigins, credentials: true }
})

// Middleware
app.use(cors({ origin: corsOriginValidator, credentials: true }))
app.use(express.json())

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

const dbState = {
  mode: 'memory',
}

const inMemoryStore = {
  users: new Map(),
  chats: new Map(),
  messages: new Map(),
}

// In-memory storage for tokens (keep for now)
const tokens = new Map()

function normalizeId(value) {
  if (value === null || value === undefined) {
    return value
  }

  return typeof value === 'string' ? value : value.toString()
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function toPlainUser(user) {
  if (!user) {
    return null
  }

  const plain = typeof user.toJSON === 'function' ? user.toJSON() : { ...user }
  plain._id = normalizeId(plain._id)
  delete plain.password
  return plain
}

function toPlainChat(chat) {
  if (!chat) {
    return null
  }

  const plain = typeof chat.toJSON === 'function' ? chat.toJSON() : { ...chat }
  plain._id = normalizeId(plain._id)
  plain.members = Array.isArray(plain.members)
    ? plain.members.map((member) => {
      if (member && typeof member === 'object' && 'email' in member) {
        return toPlainUser(member)
      }

      return normalizeId(member)
    })
    : []

  return plain
}

function toPlainMessage(message) {
  if (!message) {
    return null
  }

  const plain = typeof message.toJSON === 'function' ? message.toJSON() : { ...message }
  const sender = plain.sender && typeof plain.sender === 'object' ? plain.sender._id : plain.sender

  if (!plain.senderName && plain.sender && typeof plain.sender === 'object' && plain.sender.name) {
    plain.senderName = plain.sender.name
  }

  plain._id = normalizeId(plain._id)
  plain.chatId = normalizeId(plain.chatId)
  plain.sender = normalizeId(sender)
  return plain
}

function getUserPassword(user) {
  if (!user) {
    return null
  }

  if (typeof user.get === 'function') {
    return user.get('password')
  }

  return user.password
}

function seedInMemoryStore() {
  if (inMemoryStore.users.size > 0) {
    return
  }

  for (const user of Object.values(testUsers)) {
    inMemoryStore.users.set(user._id, { ...user })
  }

  const chatId = '607f1f77bcf86cd799439101'
  const messages = [
    {
      _id: '707f1f77bcf86cd799439201',
      chatId,
      text: 'Hey! Welcome to the chat app.',
      sender: '507f1f77bcf86cd799439012',
      senderName: 'Alice',
      seen: true,
      createdAt: new Date(Date.now() - 300000),
      updatedAt: new Date(Date.now() - 300000),
    },
    {
      _id: '707f1f77bcf86cd799439202',
      chatId,
      text: 'Thanks! Excited to test this out',
      sender: '507f1f77bcf86cd799439011',
      senderName: 'Test User',
      seen: true,
      createdAt: new Date(Date.now() - 240000),
      updatedAt: new Date(Date.now() - 240000),
    },
    {
      _id: '707f1f77bcf86cd799439203',
      chatId,
      text: 'Messages are real-time with Socket.IO.',
      sender: '507f1f77bcf86cd799439012',
      senderName: 'Alice',
      seen: false,
      createdAt: new Date(Date.now() - 180000),
      updatedAt: new Date(Date.now() - 180000),
    },
  ]

  inMemoryStore.chats.set(chatId, {
    _id: chatId,
    name: 'Test Chat',
    members: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    lastMessage: messages[messages.length - 1].text,
    lastMessageAt: messages[messages.length - 1].createdAt,
    createdAt: new Date(Date.now() - 360000),
    updatedAt: new Date(Date.now() - 180000),
  })
  inMemoryStore.messages.set(chatId, messages)
}

function getMemoryUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email)

  return Array.from(inMemoryStore.users.values()).find((user) => user.email === normalizedEmail) || null
}

function getMemoryUserById(userId) {
  return inMemoryStore.users.get(normalizeId(userId)) || null
}

function getMemoryChatById(chatId) {
  return inMemoryStore.chats.get(normalizeId(chatId)) || null
}

async function findUserByEmail(email) {
  if (dbState.mode === 'mongo') {
    return User.findOne({ email })
  }

  return getMemoryUserByEmail(email)
}

async function createUserRecord({ name, email, password }) {
  if (dbState.mode === 'mongo') {
    return User.create({ name, email, password })
  }

  const user = {
    _id: randomUUID(),
    name,
    email,
    password,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  inMemoryStore.users.set(user._id, user)
  return user
}

async function getChatsForUser(userId) {
  if (dbState.mode === 'mongo') {
    const chats = await Chat.find({ members: userId })
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 })

    return chats.map(toPlainChat)
  }

  return Array.from(inMemoryStore.chats.values())
    .filter((chat) => chat.members.includes(normalizeId(userId)))
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
    .map((chat) => toPlainChat({
      ...chat,
      members: chat.members
        .map((memberId) => getMemoryUserById(memberId))
        .filter(Boolean),
    }))
}

async function findChatBetweenUsers(userId, otherUserId) {
  if (dbState.mode === 'mongo') {
    return Chat.findOne({
      members: { $all: [userId, otherUserId], $size: 2 },
    })
  }

  return Array.from(inMemoryStore.chats.values()).find((chat) => {
    const members = chat.members.map(normalizeId)
    return members.length === 2 && members.includes(normalizeId(userId)) && members.includes(normalizeId(otherUserId))
  }) || null
}

async function findStarterChatPartner(userId) {
  const preferredEmails = ['alice@example.com', 'test@example.com', 'bob@example.com']

  if (dbState.mode === 'mongo') {
    for (const email of preferredEmails) {
      const user = await User.findOne({
        _id: { $ne: userId },
        email,
      })

      if (user) {
        return user
      }
    }

    return User.findOne({ _id: { $ne: userId } }).sort({ createdAt: 1 })
  }

  const users = Array.from(inMemoryStore.users.values())

  for (const email of preferredEmails) {
    const user = users.find((candidate) => (
      candidate.email === email && normalizeId(candidate._id) !== normalizeId(userId)
    ))

    if (user) {
      return user
    }
  }

  return users.find((candidate) => normalizeId(candidate._id) !== normalizeId(userId)) || null
}

async function ensureStarterChatForUser(user) {
  const partner = await findStarterChatPartner(user._id)

  if (!partner) {
    return []
  }

  const existingChat = await findChatBetweenUsers(user._id, partner._id)
  if (existingChat) {
    return [await hydrateChat(existingChat)]
  }

  const starterText = `Hey ${user.name || 'there'}! Welcome to the chat app.`
  const newChat = await createChatRecord({
    name: partner.name ? `Chat with ${partner.name}` : 'Welcome Chat',
    members: [user._id, partner._id],
  })

  await createMessageRecord({
    chatId: newChat._id,
    text: starterText,
    sender: partner._id,
    senderName: partner.name || 'Alice',
  })
  await updateChatLastMessage(newChat._id, starterText)

  return [await hydrateChat(newChat)]
}

async function createChatRecord({ name, members }) {
  if (dbState.mode === 'mongo') {
    return Chat.create({ name, members })
  }

  const chat = {
    _id: randomUUID(),
    name,
    members: members.map(normalizeId),
    lastMessage: '',
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  inMemoryStore.chats.set(chat._id, chat)
  inMemoryStore.messages.set(chat._id, [])
  return chat
}

async function hydrateChat(chatOrId) {
  if (!chatOrId) {
    return null
  }

  if (dbState.mode === 'mongo') {
    const chatId = chatOrId._id || chatOrId
    const chat = await Chat.findById(chatId).populate('members', 'name email avatar')
    return toPlainChat(chat)
  }

  const chatId = normalizeId(chatOrId._id || chatOrId)
  const chat = getMemoryChatById(chatId)

  if (!chat) {
    return null
  }

  return toPlainChat({
    ...chat,
    members: chat.members
      .map((memberId) => getMemoryUserById(memberId))
      .filter(Boolean),
  })
}

async function getChatForUser(chatId, userId) {
  if (dbState.mode === 'mongo') {
    return Chat.findOne({
      _id: chatId,
      members: userId,
    })
  }

  const chat = getMemoryChatById(chatId)
  if (!chat || !chat.members.includes(normalizeId(userId))) {
    return null
  }

  return chat
}

async function getMessagesForChat(chatId) {
  if (dbState.mode === 'mongo') {
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 })
    return messages.map(toPlainMessage)
  }

  return (inMemoryStore.messages.get(normalizeId(chatId)) || [])
    .slice()
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
    .map(toPlainMessage)
}

async function createMessageRecord({ chatId, text, sender, senderName }) {
  if (dbState.mode === 'mongo') {
    const message = await Message.create({
      chatId,
      text,
      sender,
      senderName,
    })

    return toPlainMessage(message)
  }

  const message = {
    _id: randomUUID(),
    chatId: normalizeId(chatId),
    text,
    sender: normalizeId(sender),
    senderName,
    seen: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const messages = inMemoryStore.messages.get(message.chatId) || []
  messages.push(message)
  inMemoryStore.messages.set(message.chatId, messages)
  return toPlainMessage(message)
}

async function updateChatLastMessage(chatId, text) {
  if (dbState.mode === 'mongo') {
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      lastMessageAt: new Date(),
    })
    return
  }

  const chat = getMemoryChatById(chatId)
  if (!chat) {
    return
  }

  chat.lastMessage = text
  chat.lastMessageAt = new Date()
  chat.updatedAt = new Date()
}

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

// ===== ROUTES =====
seedInMemoryStore()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-chat')
  .then(() => {
    dbState.mode = 'mongo'
    console.log('✅ Connected to MongoDB successfully')
  })
  .catch((err) => {
    if (allowMemoryFallback) {
      dbState.mode = 'memory'
      console.error('⚠️ MongoDB unavailable, using in-memory fallback:', err.message)
      return
    }

    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })

// Seed database after connection
mongoose.connection.once('open', () => {
  dbState.mode = 'mongo'
  seedDatabase()
})

mongoose.connection.on('disconnected', () => {
  if (allowMemoryFallback) {
    dbState.mode = 'memory'
    console.warn('⚠️ MongoDB disconnected, using in-memory fallback data')
    return
  }

  console.error('❌ MongoDB disconnected')
  process.exit(1)
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    storageMode: dbState.mode,
    allowedOrigins,
    timestamp: new Date().toISOString(),
  })
})

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const normalizedEmail = normalizeEmail(email || '')

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields required' })
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(normalizedEmail)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Create new user
    const newUser = await createUserRecord({ name, email: normalizedEmail, password })
    const token = 'token_' + newUser._id
    const plainUser = toPlainUser(newUser)
    tokens.set(token, plainUser)

    res.json({
      token,
      user: plainUser,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedEmail = normalizeEmail(email || '')

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    // Find user in database or fall back to test users
    let user = await findUserByEmail(normalizedEmail)
    if (!user && testUsers[normalizedEmail]) {
      user = getMemoryUserByEmail(normalizedEmail)
    }

    if (!user || getUserPassword(user) !== password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = 'token_' + user._id
    const plainUser = toPlainUser(user)
    tokens.set(token, plainUser)

    res.json({
      token,
      user: plainUser,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    tokens.delete(token)
  }

  res.json({ message: 'Logged out' })
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    let user = tokens.get(token)

    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    if (user.email) {
      if (dbState.mode === 'mongo') {
        const dbUser = await findUserByEmail(normalizeEmail(user.email))
        if (dbUser) {
          user = toPlainUser(dbUser)
        }
      } else {
        const memoryUser = getMemoryUserById(user._id)
        if (memoryUser) {
          user = toPlainUser(memoryUser)
        }
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

    let chats = await getChatsForUser(user._id)

    if (chats.length === 0) {
      chats = await ensureStarterChatForUser(user)
    }

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

    const otherUser = dbState.mode === 'mongo'
      ? await User.findById(userId)
      : getMemoryUserById(userId)

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if chat already exists between these users
    const existingChat = await findChatBetweenUsers(user._id, userId)

    if (existingChat) {
      return res.json(await hydrateChat(existingChat))
    }

    // Create new chat
    const newChat = await createChatRecord({
      name: 'New Chat',
      members: [user._id, userId],
    })

    res.json(await hydrateChat(newChat))
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
    const chat = await getChatForUser(chatId, user._id)

    if (!chat) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const messages = await getMessagesForChat(chatId)

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
    const chat = await getChatForUser(chatId, user._id)

    if (!chat) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Create new message
    const message = await createMessageRecord({
      chatId,
      text,
      sender: user._id,
      senderName: user.name,
    })

    // Update chat's last message
    await updateChatLastMessage(chatId, text)

    // Emit to all clients in this chat
    io.to(chatId).emit('message:received', message)

    res.json(message)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// API Documentation endpoint
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol
  const baseUrl = `${protocol}://${req.get('host')}`
  const documentation = {
    title: 'MERN Chat API Documentation',
    version: '1.0.0',
    description: 'RESTful API for real-time chat application with Socket.IO',
    storageMode: dbState.mode,
    baseUrl,
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
║  Allowed origins: ${allowedOrigins.length} configured       ║
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
