import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/pages/home';
import Login from './components/pages/Login/index.jsx';
import Register from './components/organism/Register';
import GameDetails from './components/pages/details/GameDetails';
import RetroGames from './components/pages/retroGames/RetroGames';
import RetroGameDetails from './components/pages/details/RetroGameDetails';
import Profile from './components/pages/profilo/index';
import ReviewPage from './components/pages/Reviews/reviewPage.jsx';
import Games from './components/pages/giochi/giochi.jsx';
import ContactPage from './components/pages/contact/contatti.jsx';
import ListaDesideriPage from './components/pages/listaDesideri/listaDesideri.jsx';
import ArtPage from './components/pages/art/index.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game/:id" element={<GameDetails />} />
        <Route path="/retro-games" element={<RetroGames />} />
        <Route path="/retro-games/:id" element={<RetroGameDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reviewPage" element={<ReviewPage/>} />
        <Route path='/listaDesideri' element={<ListaDesideriPage/>} />
        <Route path="/games" element={<Games/>} />
        <Route path='/contactPage' element={<ContactPage/>} />
        <Route path='/artPage' element={<ArtPage/>} />
      </Routes>
    </Router>
  );
};

export default App;
