import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('utenti');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = () => {
    localStorage.removeItem('utenti');
    setUser(null);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('utenti');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">GameReview</Link>
        <div>
          {user ? (
            <>
              <Link to="/artPage" className="text-white mx-4">Art</Link>
              <Link to="/profile" className="text-white mx-4">Profilo</Link>
              <button onClick={logout} className="text-white">Esci</button>
            </>
          ) : (
            <Link to="/login" className="text-white mx-4">Accedi</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
