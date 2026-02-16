import React, { createContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config/constants'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated, user, token } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
        userId: user._id,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('error', (err) => {
      console.error('Socket error:', err)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, user, token])

  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data)
      }
    },
    [socket, isConnected]
  )

  const on = useCallback(
    (event, callback) => {
      if (socket) {
        socket.on(event, callback)
        return () => socket.off(event, callback)
      }
    },
    [socket]
  )

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit, on }}>
      {children}
    </SocketContext.Provider>
  )
}
