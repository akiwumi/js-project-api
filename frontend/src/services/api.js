import api from '../app/config/axios'
import { API_ENDPOINTS } from '../app/config/constants'

export const authService = {
  register: async (name, email, password) => {
    const res = await api.post(API_ENDPOINTS.AUTH_REGISTER, { name, email, password })
    return res.data
  },

  login: async (email, password) => {
    const res = await api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password })
    const { token, user } = res.data
    if (token) localStorage.setItem('token', token)
    if (user) localStorage.setItem('user', JSON.stringify(user))
    return res.data
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH_LOGOUT)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getMe: async () => {
    const res = await api.get(API_ENDPOINTS.AUTH_ME)
    if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user))
    return res.data
  },
}

export const chatService = {
  getChats: async () => {
    const res = await api.get(API_ENDPOINTS.CHATS)
    return res.data
  },

  createChat: async (userId) => {
    const res = await api.post(API_ENDPOINTS.CHATS, { userId })
    return res.data
  },

  getMessages: async (chatId) => {
    const res = await api.get(`${API_ENDPOINTS.MESSAGES}/${chatId}`)
    return res.data
  },

  sendMessage: async (chatId, text) => {
    const res = await api.post(API_ENDPOINTS.MESSAGES, { chatId, text })
    return res.data
  },
}
