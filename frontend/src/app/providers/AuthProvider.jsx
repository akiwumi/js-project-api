import React, { createContext, useReducer, useEffect } from 'react'
import { authService } from '../../services/api'

export const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
        loading: false,
      }
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
        loading: false,
      }
    case 'LOGOUT':
      return initialState
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'HYDRATE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        loading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Hydrate on mount
  useEffect(() => {
    const hydrateAuth = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          const res = await authService.getMe()
          dispatch({
            type: 'HYDRATE',
            payload: { user: res.user, token },
          })
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          dispatch({ type: 'HYDRATE', payload: { user: null, token: null } })
        }
      } else {
        dispatch({ type: 'HYDRATE', payload: { user: null, token: null } })
      }
    }
    hydrateAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await authService.login(email, password)
      dispatch({ type: 'LOGIN_SUCCESS', payload: data })
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: msg })
      throw err
    }
  }

  const register = async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await authService.register(name, email, password)
      dispatch({ type: 'REGISTER_SUCCESS', payload: data })
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: msg })
      throw err
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' })

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}
