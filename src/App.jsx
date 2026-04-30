import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Messages from './pages/Messages';
import FriendsInvitations from './pages/FriendsInvitations';
import VideoFeed from './pages/VideoFeed';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AccountSettings from './pages/AccountSettings';
import Saved from './pages/Saved';
import LiveStream from './pages/LiveStream';
import UserProfile from './pages/userProfile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#F0F2F5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Routes Publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes Protégées */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/message" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/friend" element={<ProtectedRoute><FriendsInvitations /></ProtectedRoute>} />
          <Route path="/video" element={<ProtectedRoute><VideoFeed /></ProtectedRoute>} />
          <Route path="/notification" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/setting" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LiveStream /></ProtectedRoute>} />
          <Route path="/user/" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />  
          
          {/* 404 */}
          <Route path="/404" element={<NotFound/>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;