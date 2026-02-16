import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../app/hooks/useAuth'
import { useToast } from '../app/hooks/useToast'
import { useSocket, useSocketEvent } from '../app/hooks/useSocket'
import { chatService } from '../services/api'
import { Input, Spinner, Toast } from '../components/common'

export default function ChatPage() {
  const { user, logout } = useAuth()
  const { socket, isConnected } = useSocket()
  const { toast, success, error: showError } = useToast()
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typingUsers, setTypingUsers] = useState({})
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for incoming messages
  useSocketEvent('message:received', (msg) => {
    if (msg?.chatId && msg.chatId !== activeChatId) return
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev
      return [...prev, msg]
    })
  })

  // Listen for typing indicator
  useSocketEvent('user:typing', (data) => {
    if (data.chatId === activeChatId) {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: data.userName || 'User',
      }))
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev }
          delete updated[data.userId]
          return updated
        })
      }, 3000)
    }
  })

  // Listen for message seen
  useSocketEvent('message:seen', (data) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === data.messageId ? { ...msg, seen: true } : msg
      )
    )
  })

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (activeChatId) {
      fetchMessages()
      // Emit that user joined this chat
      socket?.emit('chat:join', { chatId: activeChatId })
    }
  }, [activeChatId, socket])

  const fetchChats = async () => {
    try {
      setLoading(true)
      const data = await chatService.getChats()
      setChats(Array.isArray(data) ? data : data.chats || [])
      // Set first chat as active if not already set
      if (!activeChatId && (Array.isArray(data) ? data[0] : data.chats?.[0])) {
        setActiveChatId(
          (Array.isArray(data) ? data[0] : data.chats?.[0])?._id
        )
      }
    } catch (err) {
      showError('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await chatService.getMessages(activeChatId)
      setMessages(Array.isArray(data) ? data : data.messages || [])
    } catch (err) {
      showError('Failed to load messages')
    }
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !activeChatId) return

    setMessageText('')

    try {
      const sentMsg = await chatService.sendMessage(activeChatId, messageText)
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev
        return [...prev, sentMsg]
      })
      success('Message sent')
    } catch (err) {
      showError('Failed to send message')
    }
  }

  const handleTyping = () => {
    socket?.emit('user:typing', {
      chatId: activeChatId,
      userId: user._id,
      userName: user.name,
    })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('user:stopped-typing', {
        chatId: activeChatId,
        userId: user._id,
      })
    }, 1000)
  }

  const handleLogout = async () => {
    try {
      await logout()
      socket?.disconnect()
      success('Logged out')
    } catch {
      showError('Logout failed')
    }
  }

  const typingList = Object.values(typingUsers).join(', ')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ds-bg, #f4f7fa)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 280,
          background: 'white',
          borderRight: '1px solid var(--ds-muted, #edf2f5)',
          padding: 16,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <img src={user?.avatar || 'https://i.pravatar.cc/150?img=12'} alt={user?.name} style={{ width: 48, height: 48, borderRadius: '9999px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ds-text, #24303a)' }}>
              {user?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', marginTop: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isConnected ? '#2ec8a8' : '#ccc',
                }}
              />
              {isConnected ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ds-accent, #2ec8a8)',
                cursor: 'pointer',
                fontSize: '12px',
                padding: 0,
                marginTop: 4,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <Input
          type="text"
          placeholder="Search chats"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div style={{ marginTop: 20 }}>
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ds-subtext, #7b8790)',
              textTransform: 'uppercase',
              margin: '0 0 12px 0',
            }}
          >
            Chats
          </h3>
          {loading ? (
            <Spinner />
          ) : chats.length === 0 ? (
            <div style={{ color: 'var(--ds-subtext, #7b8790)', fontSize: '14px' }}>
              No chats yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setActiveChatId(chat._id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: activeChatId === chat._id ? 'var(--ds-muted, #edf2f5)' : 'transparent',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ds-text, #24303a)' }}>
                  {chat.name || 'Chat'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ds-subtext, #7b8790)', marginTop: 2 }}>
                  {chat.lastMessage || 'No messages'}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeChatId ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: 16,
                borderBottom: '1px solid var(--ds-muted, #edf2f5)',
                background: 'white',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--ds-text, #24303a)' }}>
                Chat
              </h2>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--ds-subtext, #7b8790)' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i}>
                    <div
                      style={{
                        maxWidth: '60%',
                        alignSelf: msg.sender === user?._id ? 'flex-end' : 'flex-start',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: msg.sender === user?._id ? '#e8f9f2' : 'white',
                        color: 'var(--ds-text, #24303a)',
                        fontSize: '14px',
                        wordBreak: 'break-word',
                        marginLeft: msg.sender === user?._id ? 'auto' : 0,
                      }}
                    >
                      <div style={{ fontSize: '12px', color: 'var(--ds-subtext, #7b8790)', marginBottom: 4 }}>
                        {msg.senderName || 'User'}
                      </div>
                      {msg.text}
                      {msg.sender === user?._id && (
                        <div style={{ fontSize: '10px', color: 'var(--ds-subtext, #7b8790)', marginTop: 4 }}>
                          {msg.seen ? '✓✓' : '✓'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {typingList && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--ds-accent, #2ec8a8)',
                    fontStyle: 'italic',
                    marginTop: 4,
                  }}
                >
                  {typingList} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div
              style={{
                padding: 16,
                borderTop: '1px solid var(--ds-muted, #edf2f5)',
                background: 'white',
                display: 'flex',
                gap: 8,
              }}
            >
              <input
                type="text"
                placeholder="Write your message..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value)
                  handleTyping()
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--ds-muted, #edf2f5)',
                  fontSize: '14px',
                }}
              />
              <button onClick={sendMessage} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(180deg, var(--ds-accent), var(--ds-accent-600))', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Send</button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-subtext, #7b8790)',
            }}
          >
            Select a chat to start messaging
          </div>
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
