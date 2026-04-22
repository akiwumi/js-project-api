# MERN Chat App — Complete Frontend & Design System

## ✅ What's Delivered

### **Design System** (frontend/design-system/)
- ✅ Color tokens, typography tokens
- ✅ CSS variables for theming
- ✅ Components: Button, Avatar, Sidebar, ChatWindow
- ✅ Reusable UI: Spinner, Toast, Modal, Input

### **Frontend App** (frontend/src/)

#### **Phase 0 — Project Setup** ✓
- Vite + React 18
- React Router v7
- Axios + Socket.IO
- React Hook Form
- Full folder structure

#### **Phase 1 — Auth UI** ✓
- Login page with email/password validation
- Register page with password confirmation
- Form error handling & display
- Axios instance with request/response interceptors

#### **Phase 2 — Auth State & Persistence** ✓
- AuthProvider context + reducer pattern
- localStorage persistence (token + user)
- Hydration on app load (`/auth/me`)
- ProtectedRoute & PublicOnlyRoute guards
- useAuth hook for all pages

#### **Phase 3 — Chat UI** ✓
- Chat layout (sidebar + main chat window)
- Chat list with search
- Message display with sender info
- Message composer with send button
- User profile in sidebar with logout

#### **Phase 4 — Socket.IO Real-time** ✓
- SocketProvider context for auto-connect after auth
- useSocket & useSocketEvent hooks
- Socket events: `message:received`, `user:typing`, `message:seen`
- Chat join/leave tracking
- Automatic reconnection

#### **Phase 5 — Quality Features** ✓
- Optimistic UI (message shows instantly)
- Typing indicators with auto-clear
- Message status (✓ / ✓✓ / ⏱)
- Toast notifications (success/error/info)
- Online/offline indicator
- Auto-scroll to latest message
- Read receipts support

### **Key Files**

```txt
frontend/
├── .env                                # API & Socket URLs
├── package.json                        # Dependencies (React Router, Axios, Socket.IO)
├── vite.config.js                      # Vite bundler config
├── index.html                          # HTML entry point
├── src/
│   ├── App.jsx                         # Main router + providers
│   ├── main.jsx                        # React entry point
│   ├── styles.css                      # Global styles + CSS variables
│   ├── app/
│   │   ├── config/
│   │   │   ├── axios.js               # HTTP client with interceptors
│   │   │   └── constants.js           # Routes & API endpoints
│   │   ├── providers/
│   │   │   ├── AuthProvider.jsx       # Auth context + reducer
│   │   │   └── SocketProvider.jsx     # Socket.IO context
│   │   ├── guards/
│   │   │   └── ProtectedRoute.jsx     # Route protection guards
│   │   └── hooks/
│   │       ├── useAuth.js             # Auth hook
│   │       ├── useSocket.js           # Socket.IO hook
│   │       └── useToast.js            # Toast notifications
│   ├── pages/
│   │   ├── LoginPage.jsx              # Login form
│   │   ├── RegisterPage.jsx           # Registration form
│   │   ├── ChatPage.jsx               # Main chat interface
│   │   └── NotFoundPage.jsx           # 404 page
│   ├── components/
│   │   ├── auth/                      # Auth components (placeholder)
│   │   ├── chat/                      # Chat components (TypingIndicator, etc.)
│   │   └── common/                    # UI primitives (Button, Input, Spinner, Toast)
│   ├── services/
│   │   └── api.js                     # Auth & chat service functions
│   ├── types/                          # TypeScript types (if needed)
│   └── utils/                          # Utility functions (placeholder)
├── design-system/
│   ├── README.md                      # Design system docs
│   ├── index.js                       # Component exports
│   ├── tokens/
│   │   ├── colors.json                # Color palette
│   │   └── typography.json            # Font sizes & weights
│   ├── styles/
│   │   ├── variables.css              # CSS custom properties
│   │   └── design-system.css          # Global styles
│   └── components/
│       ├── Button.jsx
│       ├── Avatar.jsx
│       ├── Sidebar.jsx
│       └── ChatWindow.jsx
└── README.md                           # Frontend documentation
```

## 🚀 Running the App

### Development

```bash
cd frontend
npm install          # If not already done
npm run dev          # Starts on http://localhost:5173
```

### Production

```bash
cd frontend
npm run build        # Creates dist/
npm run preview      # Preview production build
```

## 🔌 Backend Requirements

Your backend must provide:

### Auth Endpoints
- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` → `{ user }`

### Chat Endpoints
- `GET /api/chats` → `{ chats: [] }` or `[]`
- `GET /api/messages/:chatId` → `{ messages: [] }` or `[]`
- `POST /api/messages` → `{ message }`

### Socket.IO Events
Backend should emit:
- `message:received` when new message arrives
- `user:typing` when user is typing
- `message:seen` when message is read

See [BACKEND_QUICK_START.md](./BACKEND_QUICK_START.md) for a minimal Express + Socket.IO template.

## 🎨 Customization

### Colors

Edit [design-system/tokens/colors.json](frontend/design-system/tokens/colors.json):
```json
{
  "accent": "#2EC8A8",        // Primary color (teal)
  "danger": "#FF6B6B",        // Error color (red)
  "text": "#24303A",          // Text color (dark gray)
  ...
}
```

Then update [design-system/styles/variables.css](frontend/design-system/styles/variables.css) with matching CSS variables.

### Fonts

Edit [design-system/tokens/typography.json](frontend/design-system/tokens/typography.json) and update CSS variables.

### Components

Add new components to [design-system/components/](frontend/design-system/components/) and export in [design-system/index.js](frontend/design-system/index.js).

## 🔐 Security Notes

**For Production**:
- ✅ Use HttpOnly cookies instead of localStorage
- ✅ Set `withCredentials: true` in Axios
- ✅ Implement token refresh mechanism
- ✅ Add CSRF protection
- ✅ Validate all form inputs server-side
- ✅ Use HTTPS for Socket.IO
- ✅ Implement rate limiting

**Current Implementation**:
- Uses localStorage for simplicity (dev-friendly)
- JWT tokens sent as `Authorization: Bearer <token>`
- Form validation client-side (also validate server-side)

## 📝 Environment Variables

Create `.env` in `frontend/` with:

```env
VITE_API_URL=http://localhost:5000          # Backend API URL
VITE_SOCKET_URL=http://localhost:5000       # Socket.IO server URL
```

For production:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

## 🧪 Testing the UI

### Without Backend (Mocked)
- Auth forms validate locally
- Chat page loads but API calls fail (check browser console for 404 errors)
- Socket won't connect (expected without server)

### With Backend
- Full auth flow works
- Chat list and messages display
- Real-time messaging works
- Typing indicators appear

## 📦 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

Netlify:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Vercel:
```bash
npm install -g vercel
vercel --prod
```

### Backend (Railway/Render/Heroku)
- Set environment variables on platform
- Deploy from Git repo
- Point frontend `VITE_API_URL` to backend URL

## 🛠 Development Tips

- Use React DevTools to inspect Auth context
- Check `localStorage` in browser DevTools → Application tab
- Socket.IO debug in console: `localStorage.debug = 'socket.io-client:*'`
- Network tab to see all API requests
- Use `npm run build` to catch production errors early

## 📚 Documentation

- [Frontend README](frontend/README.md) — Detailed setup & features
- [Design System README](frontend/design-system/README.md) — Component docs
- [MERN Roadmap](frontend/MERN_CHAT_FRONTEND_ROADMAP.md) — Architecture overview
- [Backend Quick Start](BACKEND_QUICK_START.md) — Express template

## 🎯 Next Steps

1. **Backend**: Build full Node/Express server with MongoDB
2. **Database**: Create User, Chat, Message collections
3. **Features**: Add group chats, file sharing, reactions
4. **Polish**: Dark mode, responsive mobile layout
5. **Deploy**: Push to production (Vercel + Railway)

## 📞 Support

All code follows React best practices:
- Functional components with hooks
- Context API for state management
- Custom hooks for logic reuse
- Proper error handling & user feedback
- Design system for consistency

---

**Status**: ✅ Frontend Complete (Phases 0-5) + Design System
**Next**: Build backend or integrate with existing API

Enjoy your MERN chat app! 🚀
