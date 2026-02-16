# MERN Chat Frontend

A full-featured React chat application with authentication, real-time messaging via Socket.IO, and a polished design system.

## Features

- ✅ **Authentication**: Register, login, logout with JWT tokens
- ✅ **Protected Routes**: Auth guard for chat-only routes
- ✅ **Real-time Messaging**: Socket.IO for instant message delivery
- ✅ **Typing Indicators**: Shows when users are typing
- ✅ **Message Status**: Delivery and read receipts
- ✅ **Design System**: Reusable components (Button, Avatar, Sidebar, etc.)
- ✅ **Optimistic UI**: Messages show instantly before server confirmation
- ✅ **Form Validation**: Email, password, and required field validation
- ✅ **Error Handling**: User-friendly error messages and toasts

## Tech Stack

- **React 18** + Vite
- **React Router v7** for routing
- **Axios** for API calls
- **Socket.IO Client** for real-time messaging
- **React Hook Form** for form management
- **CSS Variables** for theming

## Project Structure

```txt
src/
├── app/
│   ├── config/
│   │   ├── axios.js          # Axios instance + interceptors
│   │   └── constants.js      # Routes and API endpoints
│   ├── providers/
│   │   ├── AuthProvider.jsx  # Auth state + context
│   │   └── SocketProvider.jsx # Socket.IO provider
│   ├── guards/
│   │   └── ProtectedRoute.jsx # Route protection
│   └── hooks/
│       ├── useAuth.js        # Auth hook
│       ├── useSocket.js      # Socket hook
│       └── useToast.js       # Toast notifications
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ChatPage.jsx
│   └── NotFoundPage.jsx
├── components/
│   ├── auth/                 # Auth-related components
│   ├── chat/                 # Chat-related components (TypingIndicator, etc.)
│   └── common/               # Reusable UI (Button, Input, Spinner, Toast)
├── services/
│   └── api.js                # Auth and chat API calls
├── design-system/            # Design tokens and components
├── App.jsx                   # Main router
├── main.jsx                  # Entry point
└── styles.css                # Global styles
```

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Adjust the URLs to match your backend server.

### 3. Backend Requirements

Your backend should provide these endpoints and Socket.IO events:

#### Auth Endpoints
- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `POST /api/auth/logout` → `{}`
- `GET /api/auth/me` → `{ user }`

#### Chat Endpoints
- `GET /api/chats` → `{ chats: [] }` or `[]`
- `POST /api/chats` → `{ chatId }`
- `GET /api/messages/:chatId` → `{ messages: [] }` or `[]`
- `POST /api/messages` → `{ messageId, text, sender, ... }`

#### Socket.IO Events (Server should emit)
- `message:received` → When a new message arrives
- `user:typing` → When a user starts typing
- `message:seen` → When a message is marked as read

#### Socket.IO Events (Client emits)
- `chat:join` → When user enters a chat
- `message:send` → When user sends a message
- `user:typing` → When user is typing
- `user:stopped-typing` → When user stops typing

## Running the App

### Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Authentication Flow

1. User registers/logs in on `/register` or `/login`
2. Backend returns `token` + `user` object
3. Frontend stores token in `localStorage`
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. On app load, frontend calls `/auth/me` to verify token and restore session
6. Protected routes check `isAuthenticated` and redirect to `/login` if needed

## Real-time Messaging Flow

1. After login, `SocketProvider` connects to Socket.IO server
2. Client emits `chat:join` when user opens a chat
3. When user sends a message:
   - Frontend shows optimistic message instantly
   - Calls `POST /api/messages` to save to DB
   - Emits `message:send` via socket to notify others
4. When backend sends `message:received` event:
   - Frontend updates messages state in real-time
5. Typing indicators:
   - Client emits `user:typing` as user types
   - Others receive `user:typing` and show indicator
   - Indicator clears after 3 seconds of inactivity

## Key Features Explained

### Optimistic UI
When you send a message, it appears instantly in your chat while being sent to the server. If it fails, the message is removed and an error is shown.

### Typing Indicators
Shows "User is typing..." when someone is composing a message. Automatically clears if they stop typing for >1 second.

### Message Status
- `✓` = message sent
- `✓✓` = message delivered and read
- `⏱` = sending...

### Form Validation
All forms validate client-side before submission:
- Email must be valid format
- Password minimum 6 characters
- Confirm password must match
- All required fields must be filled

## Hooks

### `useAuth()`
Access auth state and actions:
```jsx
const { user, token, isAuthenticated, loading, error, login, register, logout } = useAuth()
```

### `useSocket()`
Access socket instance:
```jsx
const { socket, isConnected, emit, on } = useSocket()
```

### `useSocketEvent(event, callback)`
Subscribe to socket events:
```jsx
useSocketEvent('message:received', (msg) => {
  console.log('New message:', msg)
})
```

### `useToast()`
Show notifications:
```jsx
const { toast, success, error, info, show } = useToast()
success('Logged in!')
error('Something went wrong')
```

## Design System

The app uses a custom design system defined in `/design-system`:

- **Colors**: Teal accent, neutral grays, soft shadows
- **Components**: Button, Avatar, Input, Spinner, Toast, Modal
- **CSS Variables**: All colors/sizes customizable via `:root`

See [design-system/README.md](../design-system/README.md) for more details.

## Troubleshooting

### "Socket is not defined" or "Socket not connecting"
- Make sure backend is running at `VITE_SOCKET_URL`
- Backend must accept Socket.IO connections
- Check browser console for connection errors

### "401 Unauthorized" on API calls
- Token may have expired
- Try logging out and logging in again
- Check that backend returns token on login

### Messages not appearing in real-time
- Make sure `SocketProvider` wraps the app in `App.jsx`
- Backend should emit `message:received` event
- Check Socket.IO room/namespace setup

### Styling issues
- Ensure `.env` file exists and is loaded
- CSS variables should be available in `:root`
- Check that design-system CSS is imported in main.jsx

## Future Enhancements

- [ ] Image/file attachments
- [ ] Message reactions (👍, ❤️, etc.)
- [ ] User presence ("online/offline" status)
- [ ] Group chats with admin controls
- [ ] Message search
- [ ] Push notifications (PWA)
- [ ] Dark mode toggle
- [ ] User profiles and avatars

## Notes

- Token stored in `localStorage` for simplicity; consider HttpOnly cookies for production
- Typing indicators auto-clear after 3 seconds
- Messages auto-scroll to latest when new ones arrive
- Auth state persists across page refreshes via `hydrateAuth` on app load

## Support

For issues or questions, refer to the [MERN_CHAT_FRONTEND_ROADMAP.md](./MERN_CHAT_FRONTEND_ROADMAP.md) for detailed architecture and development phases.
