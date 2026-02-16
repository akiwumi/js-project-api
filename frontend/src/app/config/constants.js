export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  PROFILE: '/profile',
  NOT_FOUND: '*',
}

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',
  
  // Chats
  CHATS: '/api/chats',
  
  // Messages
  MESSAGES: '/api/messages',
}
