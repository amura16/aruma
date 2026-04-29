import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { PostProvider } from './context/PostContext'
import { ChatProvider } from './context/ChatContext'
import { FriendProvider } from './context/FriendContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PostProvider>
        <ChatProvider>
          <FriendProvider>
            <App />
          </FriendProvider>
        </ChatProvider>
      </PostProvider>
    </AuthProvider>
  </StrictMode>,
)
