# 📁 MERN Chat Application - Project Structure

## 🏗️ Complete Folder Structure

```
js-project-api/
├── 📄 README.md                           # Project overview and setup
├── 📄 STRUCTURE.md                        # This file - project structure
├── 📄 package.json                       # Root package configuration
├── 📄 package-lock.json                  # Root dependency lock file
├── 📄 server.js                           # Legacy server file (can be removed)
├── 📄 .gitignore                          # Git ignore rules
├── 📄 pull_request_template.md            # PR template for GitHub
│
├── 📂 backend/                            # 🚀 Node.js/Express Backend
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 package-lock.json              # Backend dependency lock
│   ├── 📄 server.js                      # Main Express server
│   ├── 📄 .env                           # Environment variables (gitignored)
│   ├── 📄 update-cors-for-production.js  # CORS update instructions
│   │
│   ├── 📂 models/                        # 🗄️ MongoDB Models
│   │   ├── 📄 User.js                   # User schema and model
│   │   ├── 📄 Chat.js                   # Chat schema and model
│   │   └── 📄 Message.js                # Message schema and model
│   │
│   └── 📂 node_modules/                  # Backend dependencies (gitignored)
│
├── 📂 frontend/                           # 🎨 React Frontend
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 package-lock.json              # Frontend dependency lock
│   ├── 📄 index.html                     # HTML entry point
│   ├── 📄 vite.config.js                 # Vite bundler configuration
│   ├── 📄 .env                           # Environment variables (gitignored)
│   ├── 📄 test-api.html                  # API testing page
│   │
│   ├── 📂 public/                        # Static assets
│   │   └── 📄 favicon.ico               # App favicon
│   │
│   ├── 📂 src/                           # 📱 Source Code
│   │   ├── 📄 main.jsx                   # React app entry point
│   │   ├── 📄 App.jsx                    # Main app component
│   │   ├── 📄 styles.css                 # Global styles
│   │   │
│   │   ├── 📂 app/                      # 🔧 Core Application Logic
│   │   │   ├── 📂 config/               # ⚙️ Configuration
│   │   │   │   ├── 📄 axios.js          # HTTP client setup
│   │   │   │   └── 📄 constants.js      # Routes and endpoints
│   │   │   │
│   │   │   ├── 📂 providers/            # 🔄 React Context Providers
│   │   │   │   ├── 📄 AuthProvider.jsx  # Authentication state
│   │   │   │   └── 📄 SocketProvider.jsx # Socket.IO state
│   │   │   │
│   │   │   ├── 📂 guards/               # 🛡️ Route Protection
│   │   │   │   └── 📄 ProtectedRoute.jsx # Auth route guards
│   │   │   │
│   │   │   └── 📂 hooks/                # 🎣 Custom React Hooks
│   │   │       ├── 📄 useAuth.js        # Authentication hook
│   │   │       ├── 📄 useSocket.js      # Socket.IO hook
│   │   │       └── 📄 useToast.js       # Toast notifications
│   │   │
│   │   ├── 📂 pages/                    # 📄 Page Components
│   │   │   ├── 📄 LoginPage.jsx         # Login page
│   │   │   ├── 📄 RegisterPage.jsx      # Registration page
│   │   │   ├── 📄 ChatPage.jsx          # Main chat interface
│   │   │   └── 📄 NotFoundPage.jsx      # 404 error page
│   │   │
│   │   ├── 📂 components/               # 🧩 Reusable Components
│   │   │   ├── 📂 auth/                # 🔐 Authentication components
│   │   │   ├── 📂 chat/                # 💬 Chat-specific components
│   │   │   │   ├── 📄 ChatWindow.jsx   # Main chat interface
│   │   │   │   ├── 📄 Sidebar.jsx      # Chat list sidebar
│   │   │   │   └── 📄 TypingIndicator.jsx # Typing indicator
│   │   │   │
│   │   │   └── 📂 common/              # 🔧 UI Primitives
│   │   │       ├── 📄 Button.jsx       # Button component
│   │   │       ├── 📄 Input.jsx        # Input field component
│   │   │       ├── 📄 Spinner.jsx      # Loading spinner
│   │   │       ├── 📄 Toast.jsx        # Toast notifications
│   │   │       └── 📄 Avatar.jsx       # User avatar
│   │   │
│   │   └── 📂 services/                 # 🌐 API Services
│   │       └── 📄 api.js               # API service functions
│   │
│   ├── 📂 dist/                         # 📦 Build output (gitignored)
│   │   ├── 📂 assets/
│   │   │   ├── 📄 index-*.css          # Compiled styles
│   │   │   └── 📄 index-*.js           # Compiled JavaScript
│   │   └── 📄 index.html               # Built HTML file
│   │
│   └── 📂 node_modules/                 # Frontend dependencies (gitignored)
│
├── 📂 mern/                              # 📚 Additional MERN Resources
│   └── 📂 server/                       # Alternative server setup
│       └── 📄 package.json              # Alternative dependencies
│
├── 📂 docs/                              # 📖 Documentation
│   ├── 📄 BACKEND_QUICK_START.md        # Backend setup guide
│   ├── 📄 FRONTEND_SUMMARY.md           # Frontend overview
│   ├── 📄 COMPLETION_CHECKLIST.md        # Development checklist
│   ├── 📄 API_EXAMPLES.md               # API usage examples
│   └── 📄 MERN_CHAT_FRONTEND_ROADMAP.md  # Frontend development roadmap
│
├── 📂 .claude/                           # 🤖 Claude AI Configuration
│   ├── 📂 agents/                        # AI agent specifications
│   │   └── 📂 kfc/                       # KFC agent configs
│   │       ├── 📄 spec-*.md             # Various agent specs
│   │       └── 📄 spec-*.md             # Agent configurations
│   ├── 📂 settings/                      # AI settings
│   │   └── 📄 kfc-settings.json          # KFC configuration
│   └── 📂 system-prompts/                # System prompt templates
│       └── 📄 spec-workflow-starter.md  # Workflow starter
│
└── 📂 .git/                              # 📚 Git repository (gitignored)
    ├── 📂 objects/                       # Git objects
    ├── 📂 refs/                          # Git references
    ├── 📄 HEAD                          # Current branch pointer
    └── 📄 config                        # Git configuration
```

## 🎯 Key Components Overview

### **🚀 Backend (`/backend`)**
- **`server.js`**: Main Express server with Socket.IO
- **`models/`**: Mongoose schemas for MongoDB
- **`.env`**: Environment variables (MongoDB URI, JWT secret)

### **🎨 Frontend (`/frontend`)**
- **`src/main.jsx`**: React app entry point
- **`src/App.jsx`**: Main router with providers
- **`src/app/`**: Core application logic
  - **`config/`**: API configuration and constants
  - **`providers/`**: React Context for state management
  - **`hooks/`**: Custom React hooks
  - **`guards/`**: Route protection
- **`src/pages/`**: Page-level components
- **`src/components/`**: Reusable UI components
- **`src/services/`**: API service layer

### **🗄️ Database Models**
- **`User.js`**: User authentication and profile
- **`Chat.js`**: Chat rooms and member management
- **`Message.js`**: Real-time messaging

### **📚 Documentation**
- **`BACKEND_QUICK_START.md`**: Backend setup instructions
- **`FRONTEND_SUMMARY.md`**: Frontend architecture overview
- **`COMPLETION_CHECKLIST.md`**: Development progress tracker

## 🔧 Technology Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **Mongoose** - MongoDB ODM
- **MongoDB Atlas** - Database hosting
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time client
- **CSS Variables** - Styling system

### **Development Tools**
- **Git** - Version control
- **GitHub** - Code hosting
- **Render** - Backend deployment
- **Vercel** - Frontend deployment

## 🚀 Deployment Structure

### **Production URLs**
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.onrender.com`
- **Database**: MongoDB Atlas cluster

### **Environment Variables**
```bash
# Backend (.env)
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production

# Frontend (.env)
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

## 📝 File Purposes

### **Configuration Files**
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite bundler configuration
- `.env` - Environment variables (gitignored)
- `.gitignore` - Git ignore rules

### **Entry Points**
- `backend/server.js` - Backend server entry
- `frontend/src/main.jsx` - Frontend React entry
- `frontend/index.html` - HTML template

### **Core Logic**
- `backend/models/` - Database schemas
- `frontend/src/app/` - Application core
- `frontend/src/services/` - API layer
- `frontend/src/pages/` - Route components

## 🎯 Development Workflow

1. **Local Development**: Both servers run locally
2. **Git Workflow**: Feature branches → Pull requests → Merge
3. **Deployment**: Backend to Render, Frontend to Vercel
4. **Database**: MongoDB Atlas for all environments

This structure provides a scalable, maintainable foundation for a full-stack MERN application with real-time capabilities.
