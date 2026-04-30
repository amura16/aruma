import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { PostProvider } from './context/PostContext'
import { ChatProvider } from './context/ChatContext'
import { FriendProvider } from './context/FriendContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PostProvider>
          <ChatProvider>
            <FriendProvider>
              <App />
            </FriendProvider>
          </ChatProvider>
        </PostProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
