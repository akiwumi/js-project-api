import { useContext, useEffect } from 'react'
import { SocketContext } from '../providers/SocketProvider'

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export function useSocketEvent(event, callback) {
  const { on } = useSocket()

  useEffect(() => {
    const unsubscribe = on(event, callback)
    return () => unsubscribe?.()
  }, [event, callback, on])
}
