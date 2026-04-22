import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../app/hooks/useAuth'
import { useToast } from '../app/hooks/useToast'
import { useSocket, useSocketEvent } from '../app/hooks/useSocket'
import { chatService } from '../services/api'
import { Spinner, Toast } from '../components/common'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(min-width: 961px)')
    const handleChange = (event) => {
      if (event.matches) {
        setIsSidebarOpen(false)
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  useSocketEvent('message:received', (msg) => {
    if (msg?.chatId && msg.chatId !== activeChatId) return
    setMessages((prev) => {
      if (prev.some((message) => message._id === msg._id)) return prev
      return [...prev, msg]
    })
  })

  useSocketEvent('user:typing', (data) => {
    if (data.chatId === activeChatId) {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: data.userName || 'User',
      }))

      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev }
          delete updated[data.userId]
          return updated
        })
      }, 3000)
    }
  })

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
    if (!activeChatId) {
      return
    }

    fetchMessages()
    socket?.emit('chat:join', { chatId: activeChatId })
  }, [activeChatId, socket])

  const fetchChats = async () => {
    try {
      setLoading(true)
      const data = await chatService.getChats()
      const nextChats = Array.isArray(data) ? data : data.chats || []

      setChats(nextChats)

      if (!activeChatId && nextChats[0]?._id) {
        setActiveChatId(nextChats[0]._id)
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
    const trimmedMessage = messageText.trim()

    if (!trimmedMessage || !activeChatId) return

    setMessageText('')

    try {
      const sentMsg = await chatService.sendMessage(activeChatId, trimmedMessage)
      setMessages((prev) => {
        if (prev.some((message) => message._id === sentMsg._id)) return prev
        return [...prev, sentMsg]
      })
      success('Message sent')
    } catch (err) {
      setMessageText(trimmedMessage)
      showError('Failed to send message')
    }
  }

  const handleTyping = () => {
    if (!activeChatId || !user?._id) {
      return
    }

    socket?.emit('user:typing', {
      chatId: activeChatId,
      userId: user._id,
      userName: user.name,
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

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

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId)
    setIsSidebarOpen(false)
  }

  const handleComposerKeyDown = (event) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    sendMessage()
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredChats = chats.filter((chat) => {
    if (!normalizedQuery) {
      return true
    }

    return [chat.name, chat.lastMessage]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery))
  })

  const activeChat = chats.find((chat) => chat._id === activeChatId) || null
  const typingList = Object.values(typingUsers).join(', ')

  return (
    <div className="chat-page" data-sidebar-open={isSidebarOpen}>
      <button
        type="button"
        className="chat-sidebar-backdrop"
        aria-label="Close chats panel"
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside id="chat-sidebar" className="chat-sidebar" aria-label="Chat sidebar">
        <div className="chat-profile">
          <img
            src={user?.avatar || 'https://i.pravatar.cc/150?img=12'}
            alt={user?.name || 'User avatar'}
            className="chat-avatar"
          />
          <div className="chat-profile-meta">
            <div className="chat-profile-name">{user?.name || 'User'}</div>
            <div className="chat-profile-status">
              <span className={`chat-status-dot${isConnected ? ' chat-status-dot--online' : ''}`} />
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>
          <button type="button" className="chat-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="chat-search-wrap">
          <label className="chat-search-label" htmlFor="chat-search">
            Search chats
          </label>
          <input
            id="chat-search"
            type="text"
            className="chat-search-input"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="chat-list-wrap">
          <div className="chat-list-header">Chats</div>

          {loading ? (
            <div className="chat-loading">
              <Spinner />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="chat-list-empty">
              {normalizedQuery ? 'No chats match your search' : 'No chats yet'}
            </div>
          ) : (
            <div className="chat-list">
              {filteredChats.map((chat) => (
                <button
                  key={chat._id}
                  type="button"
                  className={`chat-list-item${activeChatId === chat._id ? ' chat-list-item--active' : ''}`}
                  onClick={() => handleSelectChat(chat._id)}
                >
                  <span className="chat-list-item-name">{chat.name || 'Chat'}</span>
                  <span className="chat-list-item-preview">
                    {chat.lastMessage || 'No messages'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div className="chat-header-main">
            <button
              type="button"
              className="chat-sidebar-toggle"
              aria-controls="chat-sidebar"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              Chats
            </button>
            <div className="chat-header-copy">
              <h2 className="chat-header-title">{activeChat?.name || 'Messages'}</h2>
              <p className="chat-header-subtitle">
                {activeChat?.lastMessage || 'Pick a conversation and start chatting'}
              </p>
            </div>
          </div>
          <div className="chat-connection-pill">
            <span className={`chat-status-dot${isConnected ? ' chat-status-dot--online' : ''}`} />
            {isConnected ? 'Connected' : 'Offline'}
          </div>
        </header>

        {activeChatId ? (
          <>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty-state">
                  No messages yet. Start the conversation.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.sender === user?._id

                  return (
                    <div
                      key={msg._id || `${msg.sender}-${index}`}
                      className={`chat-message-row${isMine ? ' chat-message-row--mine' : ''}`}
                    >
                      <div className={`chat-message${isMine ? ' chat-message--mine' : ''}`}>
                        <div className="chat-message-author">
                          {msg.senderName || (isMine ? 'You' : 'User')}
                        </div>
                        <div className="chat-message-text">{msg.text}</div>
                        {isMine && (
                          <div className="chat-message-status">
                            {msg.seen ? 'Seen' : 'Sent'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {typingList && (
                <div className="chat-typing-indicator">{typingList} is typing...</div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chat-composer">
              <input
                type="text"
                className="chat-composer-input"
                placeholder="Write your message..."
                value={messageText}
                onChange={(event) => {
                  setMessageText(event.target.value)
                  handleTyping()
                }}
                onKeyDown={handleComposerKeyDown}
              />
              <button type="button" className="chat-send" onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty-panel">
            Select a chat to start messaging
          </div>
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
