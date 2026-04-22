# MERN Chat App (Frontend + Auth) — Structure & Roadmap

This document focuses on the **frontend** part of a MERN chat app, including **authorization (register/login + protected routes)** and how it connects to a typical Node/Express + MongoDB backend.

---

## Goals

- Users can **register**, **log in**, **stay logged in**, and **log out**
- Only authenticated users can access the chat UI (**protected routes**)
- Users can:
  - see a list of conversations
  - open a conversation
  - send messages
  - receive messages in real time (Socket.IO)
- Production-ready basics: form validation, loading states, error handling, and a clean project structure

---

## Recommended stack (frontend)

- **React** (Vite or CRA)
- **React Router** (routing + protected routes)
- **Axios** (API calls)
- **State**: Context + Reducer, Zustand, or Redux Toolkit (pick one)
- **Socket.IO client** (real-time messaging)
- **UI**: Tailwind (optional), or plain CSS / component library
- **Form**: React Hook Form (optional but helpful)

---

## High-level architecture

### Auth flow (typical)
1. User registers or logs in (frontend calls backend).
2. Backend returns:
   - `user` object
   - `token` (JWT)
3. Frontend stores token:
   - **Preferred**: HttpOnly cookie (set by backend) + `withCredentials` in Axios  
   - **Alternative**: localStorage (simpler, but less secure)
4. Frontend maintains an `auth` state:
   - `isAuthenticated`
   - `user`
   - `loading`
5. Protected routes check auth state and redirect to `/login` if not authenticated.

### Real-time chat flow (typical)
1. After login, frontend connects to Socket.IO server.
2. Client emits `join` / `setup` with user id.
3. When a message is sent:
   - frontend POSTs message to API (saves in MongoDB)
   - backend emits socket event to recipient(s)
4. When message arrives via socket:
   - frontend updates local conversation state instantly

---

## Backend endpoints you’ll typically need (reference)

> You can build your own, but the frontend roadmap assumes routes like these:

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (returns current user if token/cookie is valid)

### Users
- `GET /api/users/search?q=...`
- `GET /api/users/:id`

### Chats / Conversations
- `POST /api/chats` (create or access 1:1 chat)
- `GET /api/chats` (list chats for user)

### Messages
- `GET /api/messages/:chatId`
- `POST /api/messages` (send message)

---

## Frontend folder structure (suggested)

```txt
client/
  src/
    app/
      App.tsx
      router.tsx
      providers/
        AuthProvider.tsx
        SocketProvider.tsx
      config/
        axios.ts
        constants.ts
      guards/
        ProtectedRoute.tsx
        PublicOnlyRoute.tsx
      hooks/
        useAuth.ts
        useSocket.ts
      store/                  # if using Zustand/Redux
        auth.store.ts
        chat.store.ts
    pages/
      LoginPage.tsx
      RegisterPage.tsx
      ChatPage.tsx
      ProfilePage.tsx
      NotFoundPage.tsx
    components/
      layout/
        AppShell.tsx
        Navbar.tsx
        Sidebar.tsx
      auth/
        AuthCard.tsx
        LoginForm.tsx
        RegisterForm.tsx
      chat/
        ChatList.tsx
        ChatListItem.tsx
        ChatHeader.tsx
        MessageList.tsx
        MessageBubble.tsx
        MessageComposer.tsx
        TypingIndicator.tsx
      common/
        Button.tsx
        Input.tsx
        Spinner.tsx
        Toast.tsx
        Modal.tsx
    types/
      auth.ts
      chat.ts
      message.ts
      api.ts
    utils/
      storage.ts
      formatTime.ts
      validators.ts
    styles/
      globals.css
    main.tsx
```

### What each part does
- **app/config/axios.ts**: Axios instance + interceptors
- **providers/AuthProvider.tsx**: loads `/auth/me`, stores user state
- **guards/ProtectedRoute.tsx**: blocks chat routes without auth
- **providers/SocketProvider.tsx**: connects/disconnects socket after auth
- **store/**: all app state (auth, chat list, messages, active chat)
- **pages/**: route-level pages
- **components/**: UI building blocks

---

## Routing plan

```txt
/            -> redirect to /chat (if authed) or /login
/login       -> login page (public-only)
/register    -> register page (public-only)
/chat        -> main chat layout (protected)
/chat/:id    -> open a specific chat (protected)
/profile     -> profile page (protected)
*            -> 404
```

---

## State model (minimum)

### Auth state
- `user: { _id, name, email, avatar? } | null`
- `token: string | null` (if using localStorage)
- `loading: boolean`
- `error: string | null`
- `isAuthenticated: boolean`

### Chat state
- `chats: ChatSummary[]`
- `activeChatId: string | null`
- `messagesByChatId: Record<string, Message[]>`
- `typingByChatId: Record<string, string[]>` (optional)
- `loadingChats: boolean`
- `loadingMessages: boolean`

---

## Axios setup (recommended behavior)

### If using cookies (recommended)
- Backend sets cookie on login: `Set-Cookie: token=...; HttpOnly; Secure; SameSite=...`
- Frontend Axios:
  - `withCredentials: true`
  - Base URL from env

### If using localStorage
- Store token in localStorage.
- Axios interceptor adds header:
  - `Authorization: Bearer <token>`

---

## Roadmap (step-by-step)

### Phase 0 — Project setup
- [ ] Create React app (Vite recommended)
- [ ] Install dependencies:
  - router, axios, socket.io-client
- [ ] Add `.env`:
  - `VITE_API_URL=...`
  - `VITE_SOCKET_URL=...`
- [ ] Create base folder structure (as above)

**Deliverable:** app boots, routing works.

---

### Phase 1 — Auth UI (register/login)
- [ ] Build `LoginPage` and `RegisterPage`
- [ ] Add form validation + friendly error messages
- [ ] Create Axios instance (`app/config/axios.ts`)
- [ ] Create `auth` service functions:
  - `register()`, `login()`, `logout()`, `getMe()`

**Deliverable:** you can submit forms and see responses from backend in UI.

---

### Phase 2 — Auth state + persistence
- [ ] Create `AuthProvider` (or Zustand store) with:
  - `login`, `register`, `logout`, `refreshMe`
- [ ] On app load, call `/auth/me` and set auth state
- [ ] Add loading states (skeleton/spinner)
- [ ] Add `ProtectedRoute` guard for `/chat/*`

**Deliverable:** refreshing the browser keeps you logged in (cookie or stored token).

---

### Phase 3 — Chat layout (no realtime yet)
- [ ] Build `ChatPage` layout:
  - sidebar: chat list
  - main: messages + composer
- [ ] Implement API calls:
  - fetch chat list
  - fetch messages for a chat
  - send message (POST)

**Deliverable:** chat works with API only (refresh shows message history).

---

### Phase 4 — Socket.IO realtime
- [ ] Add `SocketProvider` that connects only when authenticated
- [ ] Emit `setup/join` with user id after socket connect
- [ ] On message send:
  - call API POST `/messages`
  - emit socket event like `message:new`
- [ ] Listen for `message:new`:
  - update messages state immediately
  - update chat list preview/ordering

**Deliverable:** two browsers logged in as different users can chat in real time.

---

### Phase 5 — Quality features
- [ ] Typing indicator
- [ ] Unread counts + “mark as read”
- [ ] Optimistic UI (show message instantly, roll back on failure)
- [ ] Toast notifications (errors + incoming message)
- [ ] Better empty states + responsive layout

**Deliverable:** app feels like a real product.

---

### Phase 6 — Security + production readiness
- [ ] Prefer HttpOnly cookie auth if possible
- [ ] Handle token expiry (refresh via `/auth/me`)
- [ ] Centralized error handling:
  - show useful messages (401 → redirect to login)
- [ ] Rate-limit UI actions (prevent spam clicks)
- [ ] Environment-based config (dev vs prod)
- [ ] Build + deploy (Netlify/Vercel for frontend)

**Deliverable:** stable production build with clean auth behavior.

---

## Component checklist (minimum)

### Auth
- [ ] `LoginForm`
- [ ] `RegisterForm`
- [ ] `ProtectedRoute`

### Chat
- [ ] `ChatList`
- [ ] `MessageList`
- [ ] `MessageComposer`

### Common
- [ ] `Spinner`
- [ ] `Toast`

---

## Milestones you can present (for school / portfolio)

1. **Milestone 1:** Auth pages + API calls working  
2. **Milestone 2:** Protected routes + session persistence  
3. **Milestone 3:** Chat UI + messages saved to DB via API  
4. **Milestone 4:** Real-time messaging with Socket.IO  
5. **Milestone 5:** Polished UX (typing, unread, notifications)  

---

## Suggested timeline (quick build)

- Day 1: Setup + routing + auth forms  
- Day 2: Auth provider + protected routes + persistence  
- Day 3: Chat UI + chats/messages API integration  
- Day 4: Socket realtime + polish  
- Day 5: Unread/typing + deployment  

---

## Notes on common pitfalls

- **CORS & cookies:** If using cookies, backend must enable CORS with credentials and correct origin.
- **Socket auth:** Don’t connect socket before you know who the user is.
- **State normalization:** Store messages keyed by chat id to avoid messy updates.
- **401 handling:** If API returns 401, clear auth state and redirect to `/login`.

---

## Optional enhancements (nice extras)

- Group chats, role-based admin controls
- Image/file attachments (Cloudinary/S3)
- Message reactions
- User presence (“online/offline”)
- Search messages
- Push notifications (PWA)
