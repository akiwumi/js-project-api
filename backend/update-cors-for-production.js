// CORS is now driven by environment variables instead of hardcoded values.
//
// For local development:
// CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
//
// For production:
// CLIENT_URLS=https://your-frontend.vercel.app,https://your-custom-domain.com
//
// Render dashboard:
// Environment -> add CLIENT_URLS with a comma-separated list of allowed frontend origins
