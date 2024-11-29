import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed w-56 bg-gray-950 text-white h-full p-12">
      <nav className="space-y-20">
        <Link to="/" className="block text-lg font-bold hover:text-blue-400 transition">
          Home
        </Link>
        <Link to="/games" className="block text-lg font-bold hover:text-blue-400 transition">
          Giochi
        </Link>
        <Link to="/retro-games" className="block text-lg font-bold hover:text-blue-400 transition">
          Giochi Retro
        </Link>
        <Link to="/reviewPage" className="block text-lg font-bold hover:text-blue-400 transition">
          Recensioni
        </Link>
        <Link to="/listaDesideri" className="block text-lg font-bold hover:text-blue-400 transition">
          Lista Desideri
        </Link>
        <Link to="/contactPage" className="block text-lg font-bold hover:text-blue-400 transition">
          Contattaci
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
