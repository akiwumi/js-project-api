# Frontend API Integration Guide

This document explains how the frontend communicates with the backend and what to expect.

## Authentication Flow

### Register

**Request:**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  }
}
```

**Frontend Action:**
- Stores token in localStorage
- Stores user object in localStorage
- Redirects to `/chat`

---

### Login

**Request:**
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** (same as register)
```json
{
  "token": "...",
  "user": { ... }
}
```

---

### Get Current User (on app load)

**Request:**
```javascript
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  }
}
```

**Frontend Action:**
- Restores auth state on page refresh
- If token invalid (401), clears localStorage and redirects to login

---

### Logout

**Request:**
```javascript
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Frontend Action:**
- Clears localStorage (token + user)
- Disconnects Socket.IO
- Redirects to `/login`

---

## Chat Operations

### Get All Chats

**Request:**
```javascript
GET /api/chats
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "members": ["user1_id", "user2_id"],
    "lastMessage": "Hey, how are you?",
    "unreadCount": 2,
    "createdAt": "2024-02-06T10:00:00Z"
  },
  ...
]
```

Or:
```json
{
  "chats": [...]
}
```

---

### Create Chat (1:1)

**Request:**
```javascript
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "other_user_id"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "members": ["current_user_id", "other_user_id"],
  "createdAt": "2024-02-06T10:00:00Z"
}
```

---

## Messages

### Get Messages for Chat

**Request:**
```javascript
GET /api/messages/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "chatId": "507f1f77bcf86cd799439011",
    "text": "Hey, how are you?",
    "sender": "user1_id",
    "senderName": "John Doe",
    "seen": false,
    "createdAt": "2024-02-06T10:15:00Z"
  },
  ...
]
```

Or:
```json
{
  "messages": [...]
}
```

---

### Send Message

**Request:**
```javascript
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "507f1f77bcf86cd799439011",
  "text": "Hello! How are you doing?"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "chatId": "507f1f77bcf86cd799439011",
  "text": "Hello! How are you doing?",
  "sender": "current_user_id",
  "senderName": "Current User",
  "seen": false,
  "createdAt": "2024-02-06T10:15:00Z"
}
```

**Frontend Action After Send:**
1. Optimistic update: show message instantly
2. Call API
3. Emit Socket event `message:send` to notify others
4. If API fails, remove message and show error

---

## Real-time Events via Socket.IO

### Connection Setup

When user logs in, Socket connects with auth:
```javascript
socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem('token'),
    userId: user._id
  }
})
```

---

### Client Emits

#### Join Chat Room
```javascript
socket.emit('chat:join', { chatId: '507f1f77bcf86cd799439011' })
```

#### Send Message
```javascript
socket.emit('message:send', {
  chatId: '507f1f77bcf86cd799439011',
  message: {
    _id: '...',
    text: '...',
    sender: '...',
    ...
  }
})
```

#### User Typing
```javascript
socket.emit('user:typing', {
  chatId: '507f1f77bcf86cd799439011',
  userId: 'user_id',
  userName: 'John Doe'
})
```

#### User Stopped Typing
```javascript
socket.emit('user:stopped-typing', {
  chatId: '507f1f77bcf86cd799439011',
  userId: 'user_id'
})
```

---

### Server Should Emit

#### New Message Received (to all in room)
```javascript
io.to(chatId).emit('message:received', {
  _id: '507f1f77bcf86cd799439012',
  chatId: '507f1f77bcf86cd799439011',
  text: 'Message text',
  sender: 'user_id',
  senderName: 'Sender Name',
  seen: false,
  createdAt: '2024-02-06T10:15:00Z'
})
```

#### User Typing (to others in room)
```javascript
socket.to(chatId).emit('user:typing', {
  chatId: '507f1f77bcf86cd799439011',
  userId: 'user_id',
  userName: 'John Doe'
})
```

#### Message Seen (to sender)
```javascript
socket.to(sender_id).emit('message:seen', {
  messageId: '507f1f77bcf86cd799439012',
  chatId: '507f1f77bcf86cd799439011'
})
```

---

## Error Handling

### API Error Response

If API call fails, axios interceptor checks:

**401 Unauthorized (token expired)**
```json
{
  "message": "Token expired or invalid"
}
```

Frontend Action:
- Clear localStorage
- Disconnect Socket.IO
- Redirect to `/login`

**400 Bad Request (validation error)**
```json
{
  "message": "Email already exists"
}
```

Frontend Action:
- Show error in form
- User can retry

**500 Server Error**
```json
{
  "message": "Internal server error"
}
```

Frontend Action:
- Show toast notification
- Log error for debugging

---

## CORS Configuration

Backend must allow requests from frontend:

```javascript
const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173',      // or your production URL
  credentials: true,                     // allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

Socket.IO also needs CORS:

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
})
```

---

## Frontend Service Functions

All API calls go through `src/services/api.js`:

```javascript
// Auth
await authService.register(name, email, password)
await authService.login(email, password)
await authService.logout()
await authService.getMe()

// Chat
await chatService.getChats()
await chatService.createChat(userId)
await chatService.getMessages(chatId)
await chatService.sendMessage(chatId, text)
```

Example usage in component:
```jsx
const { user, login } = useAuth()

const handleLogin = async (email, password) => {
  try {
    const data = await login(email, password)
    console.log('Logged in:', data.user)
  } catch (err) {
    console.error('Login failed:', err)
  }
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Get Chats (with token)
```bash
curl -X GET http://localhost:5000/api/chats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Send Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"chatId":"chat_id","text":"Hello!"}'
```

---

## Notes

- All times are ISO 8601 format (2024-02-06T10:15:00Z)
- `seen` field: false initially, true after user views message
- `avatar` can be any image URL or placeholder
- Socket events should be emitted to the correct `chatId` room
- Typing indicator auto-clears after 3 seconds of inactivity
- Token included in all authenticated requests as Bearer token
