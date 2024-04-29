import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage/HomePage';
import ProfilePage from './pages/profilepage/ProfilePage';
import ScrapbookPage from './pages/scrapbookpage/ScrapbookPage';
import FriendsListPage from './pages/friendslistpage/FriendsListPage';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>  
        <Route path="/" element={<HomePage />} />  
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/scrapbook" element={<ScrapbookPage />} />
        <Route path="/friends" element={<FriendsListPage />} />
      </Routes>
    </Router>
  );
}

export default App;
