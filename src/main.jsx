import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { PostProvider } from './context/PostContext'
import { ChatProvider } from './context/ChatContext'
import { FriendsProvider } from './context/FriendsContext.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { BadgeProvider } from './context/NotificationBadgeContext.jsx'
import { CommentProvider } from './context/CommentContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BadgeProvider>
          <PostProvider>
            <CommentProvider>
              <ChatProvider>
                <FriendsProvider>
                  <App />
                </FriendsProvider>
              </ChatProvider>
            </CommentProvider>
          </PostProvider>
        </BadgeProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
