import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Messages from './pages/Messages';
import FriendsInvitations from './pages/FriendsInvitations';
import VideoFeed from './pages/VideoFeed';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Saved from './pages/Saved';
import LiveStream from './pages/LiveStream';
import UserProfile from './pages/userProfile';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Route principale : Home */}
          <Route path="/" element={<Home />} />
          <Route path="/message" element={<Messages />} />
          <Route path="/friend" element={<FriendsInvitations />} />
          <Route path="/video" element={<VideoFeed />} />
          <Route path="/notification" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/setting" element={<Settings />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/404" element={<NotFound/>} />
          <Route path="/live" element={<LiveStream />} />
          <Route path="/user/" element={<UserProfile />} />  
          {/* Capture toutes les mauvaises URLs et redirige vers la Home ou 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;