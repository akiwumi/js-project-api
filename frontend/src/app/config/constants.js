function trimTrailingSlash(value = '') {
  return value.replace(/\/+$/, '')
}

function getBrowserOrigin() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.origin
}

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_URL || '')
export const SOCKET_URL = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL || getBrowserOrigin())

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
