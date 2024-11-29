import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../atoms/input';
import Button from '../../atoms/button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validateInputLogin = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !password.trim()) {
      setMessage("Tutti i campi devono essere compilati senza spazi.");
      return false;
    }
    if (!emailPattern.test(email)) {
      setMessage("Inserisci un'email valida.");
      return false;
    }
    setMessage(""); 
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); 

    if (!validateInputLogin()) return;

    try {
      const response = await fetch('http://localhost:8000/src/php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "email": email, "password": password }),
        credentials: 'include', // Mantieni la sessione
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessage(data.error || 'Login fallito');
        return; // Se ci sono errori, non proseguire
      }

      if (data.user) {
        localStorage.setItem('utenti', JSON.stringify(data.user));
        setMessage('Login effettuato con successo');
        navigate('/'); 
      }
      
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
      
      {/* Side Animations */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-b from-green-400 to-transparent animate-slide-left"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-b from-red-500 to-transparent animate-slide-right"></div>

      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg relative z-10">
        <h2 className="text-3xl font-bold text-white text-center mb-6 animate__animated animate__fadeIn">Accedi al tuo account</h2>
        <form onSubmit={handleLogin}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" text="Accedi" className="mt-4 transition-transform transform hover:scale-105 hover:bg-purple-700" />
          {message && <p className="text-red-500 text-center mt-4">{message}</p>}
        </form>
        <p className="mt-4 text-center text-white">
          Non hai un account? <Link to="/register" className="text-blue-500 hover:text-blue-300 transition-colors">Registrati</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
