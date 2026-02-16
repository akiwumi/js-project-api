// Instructions for updating CORS for production deployment

// After your backend deploys to Render, you'll get a URL like:
// https://mern-chat-backend.onrender.com

// Update the allowedOrigins array in backend/server.js:

const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:5174',           // Local development
  'http://127.0.0.1:60028',         // Browser preview
  'http://127.0.0.1:5173',          // Browser preview
  'https://your-frontend-url.vercel.app',  // Your deployed frontend
  'https://your-frontend-domain.com'      // Your custom domain (if any)
]

// Then commit and push the changes:
// git add backend/server.js
// git commit -m "Update CORS for production deployment"
// git push origin feature/mern-chat-with-mongodb
