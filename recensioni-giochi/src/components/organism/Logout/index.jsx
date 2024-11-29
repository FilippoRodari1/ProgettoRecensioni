import React from 'react';
import { useUser } from '../../global/UserContext';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const { setIsLoggedIn } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/src/php/logout.php', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg">
      Logout
    </button>
  );
};

export default Logout;
