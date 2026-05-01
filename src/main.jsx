import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { PostProvider } from './context/PostContext'
import { ChatProvider } from './context/ChatContext'
import { FriendsProvider } from './context/FriendsContext.jsx'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PostProvider>
          <ChatProvider>
            <FriendsProvider>
              <App />
            </FriendsProvider>
          </ChatProvider>
        </PostProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
